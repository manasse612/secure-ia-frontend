// === Messages d'erreur lisibles pour l'utilisateur ===
// Traduit les erreurs techniques en messages compréhensibles

export function getAnalysisErrorMessage(error) {
  const status = error.response?.status
  const detail = error.response?.data?.detail || ''

  // Erreurs réseau / timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'L\'analyse prend trop de temps. Réessayez avec un fichier plus petit.'
    }
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
  }

  // Erreurs HTTP connues
  const messages = {
    400: detail || 'Le fichier envoyé n\'est pas valide. Vérifiez le format et la taille.',
    401: 'Votre session a expiré. Veuillez vous reconnecter.',
    403: 'Vous n\'avez pas accès à cette fonctionnalité. Vérifiez votre abonnement.',
    404: 'Ce service est temporairement indisponible.',
    413: 'Le fichier est trop volumineux. Réduisez sa taille et réessayez.',
    422: detail || 'Les données envoyées sont incorrectes. Vérifiez votre saisie.',
    429: 'Vous avez atteint la limite d\'analyses. Attendez quelques minutes ou passez au plan supérieur.',
    500: detail || 'Une erreur interne est survenue. Réessayez dans quelques instants.',
    502: detail || 'Le serveur d\'analyse est temporairement indisponible. Réessayez dans quelques instants.',
    503: detail || 'Service temporairement indisponible. Réessayez dans quelques minutes.',
  }

  return messages[status] || detail || 'Une erreur inattendue est survenue. Veuillez réessayer.'
}

export function getAuthErrorMessage(error) {
  const status = error.response?.status
  const detail = error.response?.data?.detail || ''

  if (!error.response) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
  }

  const messages = {
    401: 'Email ou mot de passe incorrect.',
    403: detail || 'Accès refusé.',
    409: detail || 'Ce compte est déjà utilisé.',
    422: 'Veuillez remplir tous les champs correctement.',
    429: 'Trop de tentatives. Patientez quelques minutes.',
    500: 'Le serveur rencontre un problème. Réessayez plus tard.',
  }

  return messages[status] || detail || 'Une erreur est survenue. Veuillez réessayer.'
}
