import { HttpInterceptorFn } from '@angular/common/http';
import { User } from '../user';

export const authenticationInserterInterceptor: HttpInterceptorFn = (req, next) => {
  const uid = User.Id;
  if (!uid) return next(req);
  
  const modified = req.clone({
    setHeaders: {
      [User.UIdCode]: uid
    }
  });
  return next(modified);
};
