const ErrorMessage = ({ message, onRetry, onDismiss, title = 'Erro' }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
      <div className="flex items-start">
        <svg 
          className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          )}
          <p className="text-sm text-red-700 break-words">{message}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm text-red-600 hover:text-red-800 font-medium focus:outline-none focus:underline"
                  type="button"
                >
                  Tentar novamente
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-red-600 hover:text-red-800 font-medium focus:outline-none focus:underline"
                  type="button"
                >
                  Dispensar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
