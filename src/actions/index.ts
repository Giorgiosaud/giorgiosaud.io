import { defineAction } from 'astro:actions';
// import register from './register';
import sendEmail from './sendEmail';
// import signin from './signin';
import { z } from 'astro:schema';

export const server = {
  // register,
  // signin,
  sendEmail
}