'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { 
  Crown, 
  Star, 
  Zap, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SubscriptionStatusProps {
  className?: string;
}

const planFeatures = {
  free: {
    name: 'Gratuito',
    icon: <Star className="h-6 w-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    credits: 5,
    features: [
      '5 analogias por mês',
      'Gerador básico',
      'Suporte por email',
    ],
  },
  basic: {
    name: 'Básico',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    credits: 100,
    features: [
      '100 analogias por mês',
      'Perfis de público-alvo',
      'Favoritos ilimitados',
      'Suporte prioritário',
    ],
  },
  pro: {
    name: 'Profissional',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    credits: 500,
    features: [
      '500 analogias por mês',
      'Todos os recursos do Básico',
      'Analisador de clareza',
      'Relatórios detalhados',
      'API access',
    ],
  },
  premium: {
    name: 'Premium',
    icon: <Crown className="h-6 w-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    credits: -1, // Ilimitado
    features: [
      'Analogias ilimitadas',
      'Todos os recursos do Pro',
      'Faísca diária personalizada',
      'Suporte 24/7',
      'Consultoria mensal',
    ],
  },
};

export default function SubscriptionStatus({ className }: SubscriptionStatusProps) {
  const { user, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const currentPlan = userProfile?.plan_type || 'free';
  const planInfo = planFeatures[currentPlan];
  const creditsUsed = userProfile?.credits_used || 0;
  const totalCredits = userProfile?.credits || planInfo.credits;
  const remainingCredits = totalCredits === -1 ? -1 : Math.max(0, totalCredits - creditsUsed);
  const usagePercentage = totalCredits === -1 ? 0 : (creditsUsed / totalCredits) * 100;

  const handleUpgrade = (planType: string) => {
    // Redirecionar para página de checkout do Kiwify
    const checkoutUrls = {
      basic: 'https://kiwify.com.br/checkout/explicae-basic',
      pro: 'https://kiwify.com.br/checkout/explicae-pro',
      premium: 'https://kiwify.com.br/checkout/explicae-premium',
    };
    
    const url = checkoutUrls[planType as keyof typeof checkoutUrls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Minha Assinatura
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie seu plano e acompanhe o uso de créditos
        </p>
      </div>

      {/* Status Atual */}
      <div className={`rounded-lg border p-6 ${planInfo.bgColor} ${planInfo.borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={planInfo.color}>
              {planInfo.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Plano {planInfo.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {getStatusIcon(userProfile?.subscription_status || 'inactive')}
                <span className="capitalize">
                  {userProfile?.subscription_status || 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          
          {currentPlan !== 'premium' && (
            <Button
              onClick={() => handleUpgrade(currentPlan === 'free' ? 'basic' : 'pro')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Fazer Upgrade
            </Button>
          )}
        </div>

        {/* Uso de Créditos */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Uso de Créditos</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {totalCredits === -1 
                ? `${creditsUsed} / Ilimitado`
                : `${creditsUsed} / ${totalCredits}`
              }
            </span>
          </div>
          
          {totalCredits !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usagePercentage > 90 ? 'bg-red-500' :
                  usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          )}
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalCredits === -1 
              ? 'Créditos ilimitados'
              : `${remainingCredits} créditos restantes`
            }
          </div>
        </div>

        {/* Informações da Assinatura */}
        {userProfile?.subscription_status === 'active' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Início do Plano:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(userProfile.plan_started_at)}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Próxima Cobrança:</span>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(userProfile.plan_expires_at)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recursos do Plano Atual */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recursos Inclusos
        </h3>
        <div className="space-y-3">
          {planInfo.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Planos Disponíveis */}
      {currentPlan !== 'premium' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Planos Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(planFeatures).map(([key, plan]) => {
              if (key === 'free' || key === currentPlan) return null;
              
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-4 ${plan.bgColor} ${plan.borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={plan.color}>
                      {plan.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h4>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.credits === -1 ? 'Ilimitado' : `${plan.credits} créditos/mês`}
                  </div>
                  
                  <Button
                    onClick={() => handleUpgrade(key)}
                    size="sm"
                    className="w-full flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Assinar
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aviso de Limite */}
      {totalCredits !== -1 && usagePercentage > 80 && (
        <div className={`rounded-lg border p-4 ${
          usagePercentage > 95 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center gap-3">
            <CreditCard className={`h-5 w-5 ${
              usagePercentage > 95 ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <h4 className={`font-medium ${
                usagePercentage > 95 
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {usagePercentage > 95 ? 'Créditos Esgotados!' : 'Poucos Créditos Restantes'}
              </h4>
              <p className={`text-sm ${
                usagePercentage > 95 
                  ? 'text-red-600 dark:text-red-300'
                  : 'text-yellow-600 dark:text-yellow-300'
              }`}>
                {usagePercentage > 95 
                  ? 'Faça upgrade para continuar gerando analogias.'
                  : 'Considere fazer upgrade para não ficar sem créditos.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}