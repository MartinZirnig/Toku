import { HttpInterceptorFn } from '@angular/common/http';
import { User } from '../user';

export const authenticationInserterInterceptor: HttpInterceptorFn = (req, next) => {
  const uid = User.Id;
  if (!uid) return next(req);
  
  const headerKey = `X-${User.UIdCode}`;
  console.log(`Adding header: ${headerKey} with value: ${uid}`);
  const modified = req.clone({
    setHeaders: {
      [headerKey]: uid
    }
  });
  return next(modified);
};
