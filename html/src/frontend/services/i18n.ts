import { reactive } from 'vue';

export type Locale = 'en-US' | 'pt-PT';

const messages = {
  'en-US': {
    appName: 'Contacts',
    login: 'Login',
    logout: 'Logout',
    username: 'User name',
    password: 'Password',
    addContact: 'Add contact',
    editContact: 'Edit contact',
    create: 'Create',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    details: 'Details',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    picture: 'Picture URL',
    owner: 'Owner',
    role: 'Role',
    basic: 'Basic',
    admin: 'Admin',
    users: 'Users',
    newUser: 'New user',
    editUser: 'Edit user',
    contacts: 'Contacts',
    noContacts: 'No contacts yet.',
    deleteTitle: 'Delete contact',
    deleteBody: 'This action cannot be undone.',
    deleteUserTitle: 'Delete user',
    deleteUserBody: 'This will also remove contacts owned by this user.',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    locale: 'Language',
    loading: 'Loading...',
    error: 'Something went wrong.',
    requiredHint: 'All fields are required. Phone must contain exactly 9 digits.',
    requiredField: 'This field is required.',
    nameInvalid: 'Name must contain more than 5 characters.',
    invalidEmail: 'Enter a valid email address.',
    invalidUrl: 'Enter a valid URL.',
    passwordInvalid: 'Password must contain at least 6 characters.',
    phoneHelp: 'Use exactly 9 digits, for example 912345678.',
    phoneInvalid: 'Phone must contain exactly 9 digits.',
    contactCreated: 'Contact created successfully.',
    contactUpdated: 'Contact updated successfully.',
    contactDeleted: 'Contact deleted successfully.',
    userCreated: 'User created successfully.',
    userUpdated: 'User updated successfully.',
    userDeleted: 'User deleted successfully.',
    loginSuccess: 'Logged in successfully.'
  },
  'pt-PT': {
    appName: 'Contactos',
    login: 'Entrar',
    logout: 'Sair',
    username: 'Nome de utilizador',
    password: 'Palavra-passe',
    addContact: 'Adicionar contacto',
    editContact: 'Editar contacto',
    create: 'Criar',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    details: 'Detalhes',
    name: 'Nome',
    phone: 'Telefone',
    email: 'Email',
    picture: 'URL da imagem',
    owner: 'Dono',
    role: 'Perfil',
    basic: 'Básico',
    admin: 'Admin',
    users: 'Utilizadores',
    newUser: 'Novo utilizador',
    editUser: 'Editar utilizador',
    contacts: 'Contactos',
    noContacts: 'Ainda não existem contactos.',
    deleteTitle: 'Eliminar contacto',
    deleteBody: 'Esta ação não pode ser anulada.',
    deleteUserTitle: 'Eliminar utilizador',
    deleteUserBody: 'Isto também remove os contactos deste utilizador.',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Escuro',
    locale: 'Idioma',
    loading: 'A carregar...',
    error: 'Algo correu mal.',
    requiredHint: 'Todos os campos são obrigatórios. O telefone deve conter exatamente 9 dígitos.',
    requiredField: 'Este campo é obrigatório.',
    nameInvalid: 'O nome deve conter mais de 5 caracteres.',
    invalidEmail: 'Insira um email válido.',
    invalidUrl: 'Insira um URL válido.',
    passwordInvalid: 'A palavra-passe deve conter pelo menos 6 caracteres.',
    phoneHelp: 'Use exatamente 9 dígitos, por exemplo 912345678.',
    phoneInvalid: 'O telefone deve conter exatamente 9 dígitos.',
    contactCreated: 'Contacto criado com sucesso.',
    contactUpdated: 'Contacto atualizado com sucesso.',
    contactDeleted: 'Contacto eliminado com sucesso.',
    userCreated: 'Utilizador criado com sucesso.',
    userUpdated: 'Utilizador atualizado com sucesso.',
    userDeleted: 'Utilizador eliminado com sucesso.',
    loginSuccess: 'Sessão iniciada com sucesso.'
  }
} as const;

const savedLocale = localStorage.getItem('locale') as Locale | null;

export const i18nState = reactive({
  locale: savedLocale && messages[savedLocale] ? savedLocale : ('en-US' as Locale)
});

export const t = (key: keyof (typeof messages)['en-US']) => messages[i18nState.locale][key];

export const setLocale = (locale: Locale) => {
  i18nState.locale = locale;
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
};
