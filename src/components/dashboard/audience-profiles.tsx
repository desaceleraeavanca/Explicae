'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Users, BookOpen, Target } from 'lucide-react';
import { AudienceProfile } from '@/lib/database.types';

interface AudienceProfilesProps {
  className?: string;
}

export default function AudienceProfiles({ className }: AudienceProfilesProps) {
  const [profiles, setProfiles] = useState<AudienceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AudienceProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    age_range: '',
    education_level: '',
    interests: '',
    context: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/audience-profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const interests = formData.interests.split(',').map(i => i.trim()).filter(i => i);
      const payload = {
        ...formData,
        interests,
      };

      const url = editingProfile 
        ? `/api/audience-profiles?id=${editingProfile.id}`
        : '/api/audience-profiles';
      
      const method = editingProfile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchProfiles();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (profile: AudienceProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description,
      age_range: profile.age_range,
      education_level: profile.education_level,
      interests: profile.interests.join(', '),
      context: profile.context || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Tem certeza que deseja deletar este perfil?')) return;

    try {
      const response = await fetch(`/api/audience-profiles?id=${profileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProfiles();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao deletar perfil');
      }
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      alert('Erro ao deletar perfil');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      age_range: '',
      education_level: '',
      interests: '',
      context: '',
    });
    setEditingProfile(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Perfis de Público-Alvo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crie perfis personalizados para gerar analogias mais direcionadas
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
          disabled={profiles.length >= 10}
        >
          <Plus className="h-4 w-4" />
          Novo Perfil
        </Button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Perfil
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Estudantes de Ensino Médio"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faixa Etária
                </label>
                <Input
                  value={formData.age_range}
                  onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                  placeholder="Ex: 15-18 anos"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as características principais deste público..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nível de Educação
                </label>
                <Input
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  placeholder="Ex: Ensino Médio"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interesses (separados por vírgula)
                </label>
                <Input
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="Ex: jogos, música, esportes"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contexto Adicional (opcional)
              </label>
              <Textarea
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Informações adicionais sobre o contexto ou ambiente..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : editingProfile ? 'Atualizar' : 'Criar Perfil'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum perfil criado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Crie seu primeiro perfil de público-alvo para gerar analogias mais direcionadas
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Perfil
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {profile.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(profile)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(profile.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {profile.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {profile.age_range}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {profile.education_level}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {profile.interests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{profile.interests.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {profiles.length >= 10 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            Você atingiu o limite máximo de 10 perfis de público-alvo. 
            Delete um perfil existente para criar um novo.
          </p>
        </div>
      )}
    </div>
  );
}