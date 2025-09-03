
/// <reference types="cypress" />



const REGISTER_URL = 'https://ticketazo.com.ar/auth/registerUser';

const REGISTER_API_PATTERN = 'api/backend/register/register-user';

const selectAutocomplete = (selector, text) => {
  cy.get(selector).clear().type(text);

  cy.get('body').then(($body) => {
    const hasListbox = $body.find('[role="listbox"] [role="option"]').length > 0;
    if (hasListbox) {
      cy.get('[role="listbox"] [role="option"]').first().click();
    } else {
      cy.get(selector).type('{enter}');
    }
  });
};

const setDate = (rootSelector, { d, m, y }) => {
  cy.get(rootSelector).within(() => {
    cy.get('[data-type="day"]').click().type(String(d).padStart(2, '0'));
    cy.get('[data-type="month"]').click().type(String(m).padStart(2, '0'));
    cy.get('[data-type="year"]').click().type(String(y));
  });
};

const fillAllValid = (overrides = {}) => {
      const randomDni = () => String(Math.floor(10000000 + Math.random() * 90000000));
  const data = {
    nombres: 'Facundo',
    apellido: 'Pasqua',
    telefono: '3511234567', 
    dni: randomDni(),      
    provincia: 'Córdoba',
    localidad: 'Córdoba',
    fechaNac: { d: 5, m: 11, y: 1996 },
    email: `facu.qa+${Date.now()}@example.com`,
    confirmarEmail: null, 
    password: 'Qa!12345',
    repetirPassword: null 
  };

  Object.assign(data, overrides);
  if (!data.confirmarEmail) data.confirmarEmail = data.email;
  if (!data.repetirPassword) data.repetirPassword = data.password;

  cy.get('[data-cy="input-nombres"]').clear().type(data.nombres);
  cy.get('[data-cy="input-apellido"]').clear().type(data.apellido);

  cy.get('[data-cy="input-telefono"]').clear().type(data.telefono);
  cy.get('[data-cy="input-dni"]').clear().type(data.dni);

  selectAutocomplete('[data-cy="select-provincia"]', data.provincia);
  selectAutocomplete('[data-cy="select-localidad"]', data.localidad);

  
  if (data.fechaNac) setDate('[data-cy="input-fecha-nacimiento"]', data.fechaNac);

  cy.get('[data-cy="input-email"]').clear().type(data.email);
  cy.get('[data-cy="input-confirmar-email"]').clear().type(data.confirmarEmail);

  cy.get('[data-cy="input-password"]').clear().type(data.password, { log: false });
  cy.get('[data-cy="input-repetir-password"]').clear().type(data.repetirPassword, { log: false });

  return data;
};

const assertNoRegisterRequest = () => {
  
  cy.wait(400);

  cy.get('@register.all').should('have.length', 0);
};

describe('Registro - Validación de contraseñas', () => {
  beforeEach(() => {
    cy.intercept('POST', 'api/backend/register/register-user').as('register');
    cy.visit('https://ticketazo.com.ar/auth/registerUser');
  });

  it('no envía si las contraseñas NO coinciden', () => {
   
    fillAllValid({
      password: 'Qa!12345',
      repetirPassword: 'OtraClave123!'
    });

    cy.get('[data-cy="btn-registrarse"]').click();

  
    cy.wait(400);
    cy.get('@register.all').should('have.length', 0);

   
    cy.contains(/contraseñas no coinciden/i).should('be.visible');
  }); 

it('no permite registrarse con una fecha de nacimiento futura', () => {
  const fechaFutura = { d: 4, m: 9, y: 2025 }; 
  fillAllValid({ fechaNac: fechaFutura });

  cy.get('[data-cy="btn-registrarse"]').click();


  cy.get('input:invalid').should('have.length.greaterThan', 0);


  cy.get('[data-cy="input-fecha-nacimiento"] input[required]')
    .invoke('prop', 'validationMessage')
    .should('eq', 'El valor debe ser 3/9/2025 o anterior.');

 
  cy.get('@register.all').should('have.length', 0);
});

  
});


;