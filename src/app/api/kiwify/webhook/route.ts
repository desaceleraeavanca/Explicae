import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import crypto from 'crypto';

interface KiwifyWebhookPayload {
  event: string;
  data: {
    order_id: string;
    customer: {
      email: string;
      name: string;
      phone?: string;
    };
    product: {
      id: string;
      name: string;
    };
    payment: {
      status: string;
      amount: number;
      currency: string;
      method: string;
    };
    subscription?: {
      id: string;
      status: string;
      plan: string;
      next_billing_date?: string;
    };
  };
  timestamp: number;
}

// Verificar assinatura do webhook
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Mapear planos Kiwify para tipos internos
function mapKiwifyPlanToInternal(kiwifyPlan: string): 'free' | 'basic' | 'pro' | 'premium' {
  const planMapping: { [key: string]: 'free' | 'basic' | 'pro' | 'premium' } = {
    'explicae-basic': 'basic',
    'explicae-pro': 'pro',
    'explicae-premium': 'premium',
  };
  
  return planMapping[kiwifyPlan] || 'free';
}

// Calcular créditos baseado no plano
function getCreditsForPlan(planType: 'free' | 'basic' | 'pro' | 'premium'): number {
  const creditsMap = {
    free: 5,
    basic: 100,
    pro: 500,
    premium: -1, // Ilimitado
  };
  
  return creditsMap[planType];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-kiwify-signature');
    const webhookSecret = process.env.KIWIFY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('KIWIFY_WEBHOOK_SECRET não configurado');
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 });
    }

    if (!signature) {
      console.error('Assinatura do webhook ausente');
      return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 });
    }

    // Verificar assinatura
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('Assinatura do webhook inválida');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const payload: KiwifyWebhookPayload = JSON.parse(body);
    const supabase = createServerClient();

    // Registrar webhook para auditoria
    await supabase
      .from('kiwify_webhooks')
      .insert({
        event_type: payload.event,
        order_id: payload.data.order_id,
        customer_email: payload.data.customer.email,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

    // Processar diferentes tipos de eventos
    switch (payload.event) {
      case 'order.paid':
        await handleOrderPaid(supabase, payload);
        break;
      
      case 'order.refunded':
        await handleOrderRefunded(supabase, payload);
        break;
      
      case 'subscription.created':
        await handleSubscriptionCreated(supabase, payload);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(supabase, payload);
        break;
      
      case 'subscription.renewed':
        await handleSubscriptionRenewed(supabase, payload);
        break;
      
      default:
        console.log(`Evento não processado: ${payload.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook Kiwify:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function handleOrderPaid(supabase: any, payload: KiwifyWebhookPayload) {
  const { customer, product, payment, subscription } = payload.data;
  
  // Buscar usuário pelo email
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', customer.email)
    .single();

  // Se usuário não existe, criar conta
  if (!user) {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: customer.email,
      email_confirm: true,
      user_metadata: {
        name: customer.name,
        phone: customer.phone,
      },
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return;
    }

    user = newUser.user;
  }

  // Determinar tipo de plano
  const planType = subscription 
    ? mapKiwifyPlanToInternal(subscription.plan)
    : 'basic'; // Compra única = plano básico

  const credits = getCreditsForPlan(planType);
  const subscriptionStatus = subscription ? 'active' : 'inactive';

  // Atualizar dados do usuário
  await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      plan_type: planType,
      subscription_status: subscriptionStatus,
      subscription_id: subscription?.id,
      credits: credits === -1 ? 999999 : credits, // Ilimitado = número alto
      credits_used: 0,
      plan_started_at: new Date().toISOString(),
      plan_expires_at: subscription?.next_billing_date,
    });

  console.log(`Usuário ${customer.email} atualizado para plano ${planType}`);
}

async function handleOrderRefunded(supabase: any, payload: KiwifyWebhookPayload) {
  const { customer } = payload.data;
  
  // Reverter usuário para plano gratuito
  await supabase
    .from('users')
    .update({
      plan_type: 'free',
      subscription_status: 'cancelled',
      subscription_id: null,
      credits: 5,
      credits_used: 0,
      plan_started_at: new Date().toISOString(),
      plan_expires_at: null,
    })
    .eq('email', customer.email);

  console.log(`Reembolso processado para ${customer.email}`);
}

async function handleSubscriptionCreated(supabase: any, payload: KiwifyWebhookPayload) {
  // Mesmo processamento que order.paid para assinaturas
  await handleOrderPaid(supabase, payload);
}

async function handleSubscriptionCancelled(supabase: any, payload: KiwifyWebhookPayload) {
  const { customer, subscription } = payload.data;
  
  await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      // Manter plano até expirar
    })
    .eq('email', customer.email)
    .eq('subscription_id', subscription?.id);

  console.log(`Assinatura cancelada para ${customer.email}`);
}

async function handleSubscriptionRenewed(supabase: any, payload: KiwifyWebhookPayload) {
  const { customer, subscription } = payload.data;
  
  const planType = mapKiwifyPlanToInternal(subscription?.plan || '');
  const credits = getCreditsForPlan(planType);
  
  await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      credits: credits === -1 ? 999999 : credits,
      credits_used: 0,
      plan_expires_at: subscription?.next_billing_date,
    })
    .eq('email', customer.email)
    .eq('subscription_id', subscription?.id);

  console.log(`Assinatura renovada para ${customer.email}`);
}