import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import ContactForm from '../../src/frontend/components/ContactForm.vue';

describe('ContactForm', () => {
  it('renders required contact fields', () => {
    render(ContactForm, {
      props: {
        users: []
      }
    });

    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByLabelText('Phone')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Picture URL')).toBeTruthy();
  });

  it('shows inline validation errors before submitting invalid contact data', async () => {
    const { emitted } = render(ContactForm, {
      props: {
        users: []
      }
    });

    await fireEvent.update(screen.getByLabelText('Name'), 'Ana');
    await fireEvent.update(screen.getByLabelText('Phone'), '123');
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Name must contain more than 5 characters.')).toBeTruthy();
    expect(screen.getByText('Phone must contain exactly 9 digits.')).toBeTruthy();
    expect(emitted().submit).toBeUndefined();
  });
});
