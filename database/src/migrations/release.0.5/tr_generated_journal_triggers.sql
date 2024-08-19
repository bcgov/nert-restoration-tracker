 create trigger journal_administrative_activity_status_type after insert or update or delete on restoration.administrative_activity_status_type for each row execute procedure tr_journal_trigger();
 create trigger journal_contact_type after insert or update or delete on restoration.contact_type for each row execute procedure tr_journal_trigger();
 create trigger journal_first_nations after insert or update or delete on restoration.first_nations for each row execute procedure tr_journal_trigger();
 create trigger journal_project after insert or update or delete on restoration.project for each row execute procedure tr_journal_trigger();
 create trigger journal_branding after insert or update or delete on restoration.branding for each row execute procedure tr_journal_trigger();
 create trigger journal_authorization_type after insert or update or delete on restoration.authorization_type for each row execute procedure tr_journal_trigger();
 create trigger journal_nrm_region after insert or update or delete on restoration.nrm_region for each row execute procedure tr_journal_trigger();
 create trigger journal_permit after insert or update or delete on restoration.permit for each row execute procedure tr_journal_trigger();
 create trigger journal_project_first_nation after insert or update or delete on restoration.project_first_nation for each row execute procedure tr_journal_trigger();
 create trigger journal_project_contact after insert or update or delete on restoration.project_contact for each row execute procedure tr_journal_trigger();
 create trigger journal_project_funding_source after insert or update or delete on restoration.project_funding_source for each row execute procedure tr_journal_trigger();
 create trigger journal_project_participation after insert or update or delete on restoration.project_participation for each row execute procedure tr_journal_trigger();
 create trigger journal_project_role after insert or update or delete on restoration.project_role for each row execute procedure tr_journal_trigger();
 create trigger journal_project_spatial_component_type after insert or update or delete on restoration.project_spatial_component_type for each row execute procedure tr_journal_trigger();
 create trigger journal_project_species after insert or update or delete on restoration.project_species for each row execute procedure tr_journal_trigger();
 create trigger journal_system_constant after insert or update or delete on restoration.system_constant for each row execute procedure tr_journal_trigger();
 create trigger journal_system_metadata_constant after insert or update or delete on restoration.system_metadata_constant for each row execute procedure tr_journal_trigger();
 create trigger journal_system_user after insert or update or delete on restoration.system_user for each row execute procedure tr_journal_trigger();
 create trigger journal_project_spatial_component after insert or update or delete on restoration.project_spatial_component for each row execute procedure tr_journal_trigger();
 create trigger journal_partnership after insert or update or delete on restoration.partnership for each row execute procedure tr_journal_trigger();
 create trigger journal_objective after insert or update or delete on restoration.objective for each row execute procedure tr_journal_trigger();
 create trigger journal_conservation_area after insert or update or delete on restoration.conservation_area for each row execute procedure tr_journal_trigger();
 create trigger journal_system_user_role after insert or update or delete on restoration.system_user_role for each row execute procedure tr_journal_trigger();
 create trigger journal_system_role after insert or update or delete on restoration.system_role for each row execute procedure tr_journal_trigger();
 create trigger journal_webform_draft after insert or update or delete on restoration.webform_draft for each row execute procedure tr_journal_trigger();
 create trigger journal_user_identity_source after insert or update or delete on restoration.user_identity_source for each row execute procedure tr_journal_trigger();
 create trigger journal_administrative_activity after insert or update or delete on restoration.administrative_activity for each row execute procedure tr_journal_trigger();
 create trigger journal_administrative_activity_type after insert or update or delete on restoration.administrative_activity_type for each row execute procedure tr_journal_trigger();
 create trigger journal_project_attachment after insert or update or delete on restoration.project_attachment for each row execute procedure tr_journal_trigger();

