alter table public.enrollments
drop constraint if exists enrollments_payment_method_check;

alter table public.enrollments
add constraint enrollments_payment_method_check
check (
  payment_method is null
  or payment_method in ('cbe', 'telebirr', 'boa', 'mpesa', 'awash', 'dashen')
);
