export const CATEGORY_GROUPS = [
  {
    heading: 'Violências contra estudantes',
    items: [
      'Bullying',
      'Cyberbullying',
      'Violência física',
      'Violência psicológica',
    ],
  },
  {
    heading: 'Assédio e abuso',
    items: ['Assédio moral', 'Assédio sexual', 'Abuso psicológico'],
  },
  {
    heading: 'Discriminação e preconceito',
    items: [
      'Racismo',
      'Intolerância religiosa',
      'LGBTfobia',
      'Capacitismo',
      'Machismo',
      'Xenofobia',
    ],
  },
  {
    heading: 'Outras Ocorrências',
    items: [
      'Violações de direitos educacionais',
      'Irregularidades administrativas e financeiras',
      'Violação ética e profissional',
      'Violência institucional',
      'Segurança e integridade física',
      'Outro',
    ],
  },
]

export const ROLES = [
  'Aluno',
  'Professor',
  'Funcionário',
  'Coordenador',
  'Diretor',
  'Pai/Responsável',
  'Prestador de Serviço',
  'Comunidade',
  'Não sei informar',
  'Outro',
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const ACCEPTED_FILE_TYPES_STRING =
  '.jpg,.jpeg,.png,.gif,.webp,.pdf,.mp3,.wav,.m4a,.mp4,.mov,.avi'

export const ALLOWED_MIME_PREFIXES = [
  'image/',
  'audio/',
  'video/',
  'application/pdf',
]
