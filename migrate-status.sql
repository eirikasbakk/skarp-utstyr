alter table orders drop constraint orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('Utkast', 'Sendt', 'Videresendt til butikk'));
