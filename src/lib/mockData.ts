export interface School {
  id: string
  name: string
  network: 'Municipal' | 'Estadual' | 'Federal' | 'Privada'
  modality: 'Urbana' | 'Rural'
  municipality: string
  state: string
  status: 'ativo' | 'inativo'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'collaborator' | 'manager' | 'senior' | 'external' | 'administrador'
  avatar?: string
  escola_id?: string
}

export const schools: School[] = [
  {
    id: '1',
    name: 'Escola Municipal Alegria do Saber',
    network: 'Municipal',
    modality: 'Urbana',
    municipality: 'São Paulo',
    state: 'SP',
    status: 'ativo',
  },
  {
    id: '2',
    name: 'Colégio Estadual Futuro Brilhante',
    network: 'Estadual',
    modality: 'Urbana',
    municipality: 'Campinas',
    state: 'SP',
    status: 'ativo',
  },
  {
    id: '3',
    name: 'Escola Rural Caminho da Luz',
    network: 'Municipal',
    modality: 'Rural',
    municipality: 'Sorocaba',
    state: 'SP',
    status: 'inativo',
  },
  {
    id: '4',
    name: 'Instituto Federal de Tecnologia',
    network: 'Federal',
    modality: 'Urbana',
    municipality: 'São Paulo',
    state: 'SP',
    status: 'ativo',
  },
  {
    id: '5',
    name: 'Colégio Privado Excelência',
    network: 'Privada',
    modality: 'Urbana',
    municipality: 'Santos',
    state: 'SP',
    status: 'ativo',
  },
]

export const users: User[] = [
  {
    id: 'u1',
    name: 'João Silva',
    email: 'collab@alertia.com',
    role: 'collaborator',
  },
  {
    id: 'u2',
    name: 'Maria Souza',
    email: 'manager@alertia.com',
    role: 'manager',
  },
  {
    id: 'u3',
    name: 'Carlos Pereira',
    email: 'senior@alertia.com',
    role: 'senior',
  },
]

export const mockRiskData = [
  { category: 'Assédio', count: 12, fill: 'var(--color-assedio)' },
  { category: 'Fraude', count: 5, fill: 'var(--color-fraude)' },
  { category: 'Discriminação', count: 8, fill: 'var(--color-discriminacao)' },
  { category: 'Outros', count: 3, fill: 'var(--color-outros)' },
]

export const mockTrainingModules = [
  {
    id: 1,
    title: 'Código de Conduta e Ética',
    status: 'Concluído',
    progress: 100,
  },
  {
    id: 2,
    title: 'Prevenção à Lavagem de Dinheiro',
    status: 'Em Andamento',
    progress: 45,
  },
  {
    id: 3,
    title: 'Segurança da Informação',
    status: 'Não Iniciado',
    progress: 0,
  },
]

export const mockComplaints = [
  {
    protocol: '20231024-001',
    status: 'Em Investigação',
    date: '2023-10-24',
    type: 'Assédio',
  },
  {
    protocol: '20231105-012',
    status: 'Registrada',
    date: '2023-11-05',
    type: 'Fraude',
  },
  {
    protocol: '20230915-099',
    status: 'Concluída',
    date: '2023-09-15',
    type: 'Outros',
  },
]
