 create trigger audit_administrative_activity_status_type before insert or update or delete on restoration.administrative_activity_status_type for each row execute procedure tr_audit_trigger();
 create trigger audit_contact_type before insert or update or delete on restoration.contact_type for each row execute procedure tr_audit_trigger();
 create trigger audit_first_nations before insert or update or delete on restoration.first_nations for each row execute procedure tr_audit_trigger();
 create trigger audit_project before insert or update or delete on restoration.project for each row execute procedure tr_audit_trigger();
 create trigger audit_branding before insert or update or delete on restoration.branding for each row execute procedure tr_audit_trigger();
 create trigger audit_nrm_region before insert or update or delete on restoration.nrm_region for each row execute procedure tr_audit_trigger();
 create trigger audit_permit before insert or update or delete on restoration.permit for each row execute procedure tr_audit_trigger();
 create trigger audit_project_first_nation before insert or update or delete on restoration.project_first_nation for each row execute procedure tr_audit_trigger();
 create trigger audit_project_contact before insert or update or delete on restoration.project_contact for each row execute procedure tr_audit_trigger();
 create trigger audit_project_funding_source before insert or update or delete on restoration.project_funding_source for each row execute procedure tr_audit_trigger();
 create trigger audit_project_participation before insert or update or delete on restoration.project_participation for each row execute procedure tr_audit_trigger();
 create trigger audit_project_role before insert or update or delete on restoration.project_role for each row execute procedure tr_audit_trigger();
 create trigger audit_project_spatial_component_type before insert or update or delete on restoration.project_spatial_component_type for each row execute procedure tr_audit_trigger();
 create trigger audit_project_species before insert or update or delete on restoration.project_species for each row execute procedure tr_audit_trigger();
 create trigger audit_system_constant before insert or update or delete on restoration.system_constant for each row execute procedure tr_audit_trigger();
 create trigger audit_system_metadata_constant before insert or update or delete on restoration.system_metadata_constant for each row execute procedure tr_audit_trigger();
 create trigger audit_system_user before insert or update or delete on restoration.system_user for each row execute procedure tr_audit_trigger();
 create trigger audit_project_spatial_component before insert or update or delete on restoration.project_spatial_component for each row execute procedure tr_audit_trigger();
 create trigger audit_partnership before insert or update or delete on restoration.partnership for each row execute procedure tr_audit_trigger();
 create trigger audit_objective before insert or update or delete on restoration.objective for each row execute procedure tr_audit_trigger();
 create trigger audit_conservation_area before insert or update or delete on restoration.conservation_area for each row execute procedure tr_audit_trigger();
 create trigger audit_system_user_role before insert or update or delete on restoration.system_user_role for each row execute procedure tr_audit_trigger();
 create trigger audit_system_role before insert or update or delete on restoration.system_role for each row execute procedure tr_audit_trigger();
 create trigger audit_webform_draft before insert or update or delete on restoration.webform_draft for each row execute procedure tr_audit_trigger();
 create trigger audit_user_identity_source before insert or update or delete on restoration.user_identity_source for each row execute procedure tr_audit_trigger();
 create trigger audit_administrative_activity before insert or update or delete on restoration.administrative_activity for each row execute procedure tr_audit_trigger();
 create trigger audit_administrative_activity_type before insert or update or delete on restoration.administrative_activity_type for each row execute procedure tr_audit_trigger();
 create trigger audit_project_attachment before insert or update or delete on restoration.project_attachment for each row execute procedure tr_audit_trigger();

