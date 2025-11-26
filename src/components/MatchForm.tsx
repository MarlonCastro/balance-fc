import { useForm } from 'react-hook-form';

interface MatchFormData {
  name: string;
  day: string;
  time: string;
  numberOfPeople: number;
}

interface MatchFormProps {
  initialData?: Partial<MatchFormData>;
  onSubmit: (data: MatchFormData) => void;
  isLoading?: boolean;
}

export function MatchForm({ initialData, onSubmit, isLoading = false }: MatchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome da Pelada <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: 'Nome da pelada é obrigatório',
            minLength: { value: 2, message: 'O nome deve ter pelo menos 2 caracteres' },
          })}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Digite o nome da pelada (ex: Pelada de Sábado)"
          disabled={isLoading || isSubmitting}
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span>⚠</span>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            id="day"
            type="date"
            {...register('day', { required: 'Data é obrigatória' })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            disabled={isLoading || isSubmitting}
          />
          {errors.day && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠</span>
              {errors.day.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Horário <span className="text-red-500">*</span>
          </label>
          <input
            id="time"
            type="time"
            {...register('time', { required: 'Horário é obrigatório' })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            disabled={isLoading || isSubmitting}
          />
          {errors.time && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>⚠</span>
              {errors.time.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Número de Pessoas <span className="text-red-500">*</span>
        </label>
        <input
          id="numberOfPeople"
          type="number"
          min="2"
          max="50"
          {...register('numberOfPeople', {
            required: 'Número de pessoas é obrigatório',
            min: { value: 2, message: 'Mínimo de 2 pessoas necessário' },
            max: { value: 50, message: 'Máximo de 50 pessoas permitido' },
            valueAsNumber: true,
          })}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          placeholder="Digite o número de pessoas"
          disabled={isLoading || isSubmitting}
        />
        {errors.numberOfPeople && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span>⚠</span>
            {errors.numberOfPeople.message}
          </p>
        )}
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Número total de jogadores esperados para esta pelada
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
      >
        {isSubmitting || isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </span>
        ) : (
          'Salvar Pelada'
        )}
      </button>
    </form>
  );
}

