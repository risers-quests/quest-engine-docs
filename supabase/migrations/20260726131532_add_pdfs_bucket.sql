-- Storage for finished PDFs (docs/06_data_model.md's builds.pdf_path).
-- Public bucket: v1 has no login/auth (single implicit user), so a public
-- download URL is consistent with the rest of the app's no-auth design.
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', true)
on conflict (id) do nothing;
