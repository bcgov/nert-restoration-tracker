-- populate_project_spatial_component_type.sql
insert into project_spatial_component_type (name, record_effective_date, description) values ('Boundary', now(), 'The spatial boundary of the project.');
insert into project_spatial_component_type (name, record_effective_date, description) values ('Mask', now(), 'A mask that is applied to the project boundary.');
