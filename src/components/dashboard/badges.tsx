'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Users, Target, BookOpen, Crown, Search, Award } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: string;
  earned: boolean;
  earned_at?: string;
  progress: number;
  progress_percentage: number;
}

interface BadgesProps {
  className?: string;
}

export default function Badges({ className }: BadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState({
    generation_count: 0,
    favorite_count: 0,
    profile_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'unearned'>('all');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '🎯': <Target className="h-8 w-8" />,
      '🔍': <Search className="h-8 w-8" />,
      '🏆': <Trophy className="h-8 w-8" />,
      '👑': <Crown className="h-8 w-8" />,
      '⭐': <Star className="h-8 w-8" />,
      '📚': <BookOpen className="h-8 w-8" />,
      '👥': <Users className="h-8 w-8" />,
      '🎭': <Award className="h-8 w-8" />,
    };
    
    return iconMap[iconName] || <Award className="h-8 w-8" />;
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned') return badge.earned;
    if (filter === 'unearned') return !badge.earned;
    return true;
  });

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;

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
            Badges e Conquistas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Acompanhe seu progresso e conquiste novos badges
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {earnedCount}/{totalCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Badges conquistados
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.generation_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Analogias Criadas
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.favorite_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Favoritas Salvas
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.profile_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Perfis Criados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Todos ({totalCount})
        </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'earned'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Conquistados ({earnedCount})
        </button>
        <button
          onClick={() => setFilter('unearned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unearned'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Não Conquistados ({totalCount - earnedCount})
        </button>
      </div>

      {/* Grid de Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`relative bg-white dark:bg-gray-800 rounded-lg border p-6 transition-all hover:shadow-lg ${
              badge.earned
                ? 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {badge.earned && (
              <div className="absolute top-2 right-2">
                <div className="bg-green-500 text-white rounded-full p-1">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
            )}

            <div className="text-center">
              <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${
                badge.earned
                  ? 'bg-green-100 dark:bg-green-900 text-green-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}>
                {getIconComponent(badge.icon)}
              </div>

              <h3 className={`font-semibold mb-2 ${
                badge.earned
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {badge.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {badge.description}
              </p>

              {!badge.earned && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>{badge.progress}/{badge.requirement}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${badge.progress_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {badge.earned && badge.earned_at && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  Conquistado em {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filter === 'earned' ? 'Nenhum badge conquistado ainda' : 'Nenhum badge disponível'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'earned' 
              ? 'Continue usando o Explicaê para conquistar seus primeiros badges!'
              : 'Ajuste os filtros para ver os badges disponíveis.'
            }
          </p>
        </div>
      )}
    </div>
  );
}