import 'express-session';

// Estende as definições de tipos do express-session
declare module 'express-session' {
  interface SessionData {
    userId?: string | number;
    userRole?: 'student' | 'teacher' | 'manager' | 'admin';
    authenticated?: boolean;
    escola_id?: string;
    userName?: string;
    userEmail?: string;
  }
}