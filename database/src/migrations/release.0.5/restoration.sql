--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      Restoration.DM1
--
-- Date Created : Friday, April 01, 2022 09:46:39
-- Target DBMS : PostgreSQL 10.x-12.x
--

--
-- TABLE: authorization_type
--

CREATE TABLE authorization_type(
    authorization_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    description              varchar(250),
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT authorization_types_pk PRIMARY KEY (authorization_type_id)
)
;

COMMENT ON COLUMN authorization_type.authorization_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN authorization_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN authorization_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN authorization_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN authorization_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN authorization_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN authorization_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN authorization_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN authorization_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN authorization_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE authorization_type IS 'Authorization types are a list of authorization types that are used to control access to the application.'
;

--
-- TABLE: branding
--

CREATE TABLE branding(
    branding_id             integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                    varchar(50)       NOT NULL,
    value                   varchar(50),
    record_effective_date   date              NOT NULL,
    record_end_date         date,
    create_date             timestamptz(6)    DEFAULT now() NOT NULL,
    create_user             integer           NOT NULL,
    update_date             timestamptz(6),
    update_user             integer,
    revision_count          integer           DEFAULT 0 NOT NULL,
    CONSTRAINT branding_pk PRIMARY KEY (branding_id)
)
;

COMMENT ON COLUMN branding.branding_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN branding.name IS 'The name of the record.'
;
COMMENT ON COLUMN branding.value IS 'The value of the record.'
;
COMMENT ON COLUMN branding.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN branding.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN branding.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN branding.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN branding.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN branding.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN branding.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE branding IS 'Branding is a list of branding elements that are used to customize the application.'
;
-- 
-- TABLE: administrative_activity 
--

CREATE TABLE administrative_activity(
    administrative_activity_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    administrative_activity_status_type_id    integer           NOT NULL,
    administrative_activity_type_id           integer           NOT NULL,
    reported_system_user_id                   integer           NOT NULL,
    assigned_system_user_id                   integer,
    description                               varchar(3000),
    data                                      json,
    notes                                     varchar(3000),
    create_date                               timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                               integer           NOT NULL,
    update_date                               timestamptz(6),
    update_user                               integer,
    revision_count                            integer           DEFAULT 0 NOT NULL,
    CONSTRAINT administrative_activity_pk PRIMARY KEY (administrative_activity_id)
)
;



COMMENT ON COLUMN administrative_activity.administrative_activity_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.administrative_activity_status_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.administrative_activity_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.reported_system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.assigned_system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN administrative_activity.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN administrative_activity.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity IS 'Administrative activity is a list of activities to be performed in order to maintain the business processes of the system.'
;

-- 
-- TABLE: administrative_activity_status_type 
--

CREATE TABLE administrative_activity_status_type(
    administrative_activity_status_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                      varchar(50)       NOT NULL,
    description                               varchar(250),
    record_effective_date                     date              NOT NULL,
    record_end_date                           date,
    create_date                               timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                               integer           NOT NULL,
    update_date                               timestamptz(6),
    update_user                               integer,
    revision_count                            integer           DEFAULT 0 NOT NULL,
    CONSTRAINT administrative_activity_status_type_pk PRIMARY KEY (administrative_activity_status_type_id)
)
;



COMMENT ON COLUMN administrative_activity_status_type.administrative_activity_status_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity_status_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN administrative_activity_status_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity_status_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN administrative_activity_status_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN administrative_activity_status_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity_status_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_status_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity_status_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_status_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity_status_type IS 'Administrative activity status type describes a class of statuses that describe the state of an administrative activity record.'
;

-- 
-- TABLE: administrative_activity_type 
--

CREATE TABLE administrative_activity_type(
    administrative_activity_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                               varchar(50)       NOT NULL,
    description                        varchar(250),
    record_effective_date              date              NOT NULL,
    record_end_date                    date,
    create_date                        timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                        integer           NOT NULL,
    update_date                        timestamptz(6),
    update_user                        integer,
    revision_count                     integer           DEFAULT 0 NOT NULL,
    CONSTRAINT administrative_activity_type_pk PRIMARY KEY (administrative_activity_type_id)
)
;



COMMENT ON COLUMN administrative_activity_type.administrative_activity_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN administrative_activity_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN administrative_activity_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN administrative_activity_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN administrative_activity_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN administrative_activity_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN administrative_activity_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN administrative_activity_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN administrative_activity_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE administrative_activity_type IS 'Administrative activity type describes a class of administrative activities that is performed in order to maintain the business processes of the application.'
;

-- 
-- TABLE: audit_log 
--

CREATE TABLE audit_log(
    audit_log_id      integer         GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id    integer         NOT NULL,
    create_date       TIMESTAMPTZ     DEFAULT now() NOT NULL,
    table_name        varchar(200)    NOT NULL,
    operation         varchar(20)     NOT NULL,
    before_value      json,
    after_value       json,
    CONSTRAINT audit_log_pk PRIMARY KEY (audit_log_id)
)
;



COMMENT ON COLUMN audit_log.audit_log_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN audit_log.system_user_id IS 'The system user id affecting the data change.'
;
COMMENT ON COLUMN audit_log.create_date IS 'The date and time of record creation.'
;
COMMENT ON COLUMN audit_log.table_name IS 'The table name of the data record.'
;
COMMENT ON COLUMN audit_log.operation IS 'The operation that affected the data change (ie. INSERT, UPDATE, DELETE, TRUNCATE).'
;
COMMENT ON COLUMN audit_log.before_value IS 'The JSON representation of the before value of the record.'
;
COMMENT ON COLUMN audit_log.after_value IS 'The JSON representation of the after value of the record.'
;
COMMENT ON TABLE audit_log IS 'Holds record level audit log data for the entire database.'
;

-- 
-- TABLE: contact_type 
--

CREATE TABLE contact_type(
    contact_type_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    description              varchar(250),
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT contact_type_pk PRIMARY KEY (contact_type_id)
)
;



COMMENT ON COLUMN contact_type.contact_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN contact_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN contact_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN contact_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN contact_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN contact_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN contact_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN contact_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN contact_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN contact_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE contact_type IS 'A list of contact types. Example types include "Coordinator".'
;

-- 
-- TABLE: first_nations 
--

CREATE TABLE first_nations(
    first_nations_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(300)      NOT NULL,
    description              varchar(250),
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT first_nations_pk PRIMARY KEY (first_nations_id)
)
;



COMMENT ON COLUMN first_nations.first_nations_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN first_nations.name IS 'The name of the record.'
;
COMMENT ON COLUMN first_nations.description IS 'The description of the record.'
;
COMMENT ON COLUMN first_nations.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN first_nations.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN first_nations.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN first_nations.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN first_nations.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN first_nations.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN first_nations.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE first_nations IS 'A list of first nations.'
;

-- 
-- TABLE: nrm_region 
--

CREATE TABLE nrm_region(
    nrm_region_id     integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id        integer           NOT NULL,
    name              varchar(300)      NOT NULL,
    objectid          integer           NOT NULL,
    create_date       timestamptz(6)    DEFAULT now() NOT NULL,
    create_user       integer           NOT NULL,
    update_date       timestamptz(6),
    update_user       integer,
    revision_count    integer           DEFAULT 0 NOT NULL,
    CONSTRAINT nrm_region_pl PRIMARY KEY (nrm_region_id)
)
;



COMMENT ON COLUMN nrm_region.nrm_region_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN nrm_region.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN nrm_region.name IS 'The name of the record.'
;
COMMENT ON COLUMN nrm_region.objectid IS 'The objectid supplied by the BCGW layer.'
;
COMMENT ON COLUMN nrm_region.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN nrm_region.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN nrm_region.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN nrm_region.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN nrm_region.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE nrm_region IS 'Natural Resource (NR) Region, are administrative areas established by the Ministry, within NR Areas. These boundaries are designated by the Lieutenant Governor in council and published as regulations which establishes the Ministry''s management areas. The source of truth for this data is the BCGW layer WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG.'
;

-- 
-- TABLE: permit 
--

CREATE TABLE permit(
    permit_id                    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id               integer           NOT NULL,
    project_id                   integer,
    number                       varchar(100),
    type                         varchar(300)      NOT NULL,
    description                  varchar(300),
    coordinator_first_name       varchar(50),
    coordinator_last_name        varchar(50),
    coordinator_email_address    varchar(500),
    coordinator_agency_name      varchar(300),
    issue_date                   date,
    end_date                     date,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
    CONSTRAINT permit_pk PRIMARY KEY (permit_id)
)
;



COMMENT ON COLUMN permit.permit_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN permit.number IS 'Permit number provided by FrontCounter BC.'
;
COMMENT ON COLUMN permit.type IS 'The type of the permit.'
;
COMMENT ON COLUMN permit.description IS 'Description of the permit.'
;
COMMENT ON COLUMN permit.coordinator_first_name IS 'The first name of the permit coordinator.'
;
COMMENT ON COLUMN permit.coordinator_last_name IS 'The last name of the permit coordinator.'
;
COMMENT ON COLUMN permit.coordinator_email_address IS 'The email address.'
;
COMMENT ON COLUMN permit.coordinator_agency_name IS 'The permit coordinator agency name.'
;
COMMENT ON COLUMN permit.issue_date IS 'The date the permit was issued.'
;
COMMENT ON COLUMN permit.end_date IS 'The date the permit is no longer valid.'
;
COMMENT ON COLUMN permit.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN permit.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN permit.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN permit.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN permit.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE permit IS 'Provides a record of scientific permits. Note that permits are first class objects in the data model and do not require an association to either a project or survey. Additionally:
- Association to a survey or project implies that sampling was conducted related to the permit 
- No association to a survey or project implies that sampling was not conducted related to the permit
- Permits that are associated with a project should eventually be related to a survey
- Permits can be associated with one or zero projects
- Permits can only be associated with one survey
- Permits that have no association with a project or survey require values for coordinator first name, last name, email address and agency name

NOTE: there are conceptual problems with associating permits to projects early instead of at the survey level and these should be addressed in subsequent versions of the application.'
;

-- 
-- TABLE: objective 
--

CREATE TABLE objective(
    objective_id                 integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                   integer,
    objective                    varchar(500)      NOT NULL,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
    CONSTRAINT objective_pk PRIMARY KEY (objective_id)
)
;

COMMENT ON COLUMN objective.objective_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN objective.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN objective.objective IS 'Project objective'
;
COMMENT ON COLUMN objective.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN objective.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN objective.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN objective.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN objective.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE objective IS 'Stores project objectives.'
;

-- 
-- TABLE: conservation_area 
--

CREATE TABLE conservation_area(
    conservation_area_id         integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                   integer,
    conservation_area            varchar(200)      NOT NULL,
    create_date                  timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                  integer           NOT NULL,
    update_date                  timestamptz(6),
    update_user                  integer,
    revision_count               integer           DEFAULT 0 NOT NULL,
    CONSTRAINT conservation_area_pk PRIMARY KEY (conservation_area_id)
)
;

COMMENT ON COLUMN conservation_area.conservation_area_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN conservation_area.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN conservation_area.conservation_area IS 'Project conservation_area'
;
COMMENT ON COLUMN conservation_area.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN conservation_area.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN conservation_area.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN conservation_area.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN conservation_area.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE conservation_area IS 'Stores project conservation areas.'
;

-- 
-- TABLE: project 
--

CREATE TABLE project(
    project_id                  integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    uuid                        uuid              DEFAULT public.gen_random_uuid(),
    is_project                  boolean           NOT NULL,
    name                        varchar(300),
    brief_desc                  varchar(3000)     NOT NULL,
    start_date                  date,
    end_date                    date,
    actual_start_date           date,
    actual_end_date             date,
    state_code                  integer           NOT NULL,
    people_involved             integer,
    is_healing_land             boolean           DEFAULT false,
    is_healing_people           boolean           DEFAULT false,
    is_land_initiative          boolean           DEFAULT false,
    is_cultural_initiative      boolean           DEFAULT false,
    is_project_part_public_plan boolean           DEFAULT false,
    publish_timestamp           TIMESTAMPTZ,
    create_date                 timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                 integer           NOT NULL,
    update_date                 timestamptz(6),
    update_user                 integer,
    revision_count              integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_pk PRIMARY KEY (project_id)
)
;



COMMENT ON COLUMN project.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project.uuid IS 'The universally unique identifier for the record.'
;
COMMENT ON COLUMN project.is_project IS 'When true project, when false plan.'
;
COMMENT ON COLUMN project.name IS 'Name given to a project or plan.'
;
COMMENT ON COLUMN project.brief_desc IS 'Brief description of a project or plan.'
;
COMMENT ON COLUMN project.start_date IS 'The planned start date of a project or a plan.'
;
COMMENT ON COLUMN project.end_date IS 'The planned end date of a project or plan.'
;
COMMENT ON COLUMN project.actual_start_date IS 'The actual start date of a project.'
;
COMMENT ON COLUMN project.actual_end_date IS 'The actual end date of a project.'
;
COMMENT ON COLUMN project.state_code IS 'The state of a project or plan within their corresponding workflows.'
;
COMMENT ON COLUMN project.people_involved IS 'The number of people involved in a Healing the People project.'
;
COMMENT ON COLUMN project.is_healing_land IS 'Project or plan focused on healing the land.'
;
COMMENT ON COLUMN project.is_healing_people IS 'Project or plan focused on healing the people.'
;
COMMENT ON COLUMN project.is_land_initiative IS 'Project or plan focused on land based restoration initiative.'
;
COMMENT ON COLUMN project.is_cultural_initiative IS 'Project or plan focused on cultural or community investment initiative.'
;
COMMENT ON COLUMN project.is_project_part_public_plan IS 'Project is or not part of a publicly available restoration plan.'
;
COMMENT ON COLUMN project.publish_timestamp IS 'A timestamp that indicates that the project metadata has been approved for discovery. If the timestamp is not null then project metadata is public. If the timestamp is null the project metadata is not yet public.'
;
COMMENT ON COLUMN project.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project IS 'The top level organizational structure for project data collection. '
;

-- 
-- TABLE: project_attachment 
--

CREATE TABLE project_attachment(
    project_attachment_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id               integer           NOT NULL,
    file_name                varchar(300)      NOT NULL,
    file_type                varchar(100)      NOT NULL,
    title                    varchar(300)      NOT NULL,
    description              varchar(3000),
    key                      varchar(1000)     NOT NULL,
    file_size                integer,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_attachment_pk PRIMARY KEY (project_attachment_id)
)
;



COMMENT ON COLUMN project_attachment.project_attachment_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_attachment.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_attachment.file_name IS 'The name of the file attachment.'
;
COMMENT ON COLUMN project_attachment.file_type IS 'The attachment type. Attachment type examples include video, audio and field data.'
;
COMMENT ON COLUMN project_attachment.title IS 'The title of the file.'
;
COMMENT ON COLUMN project_attachment.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_attachment.key IS 'The identifying key to the file in the storage system.'
;
COMMENT ON COLUMN project_attachment.file_size IS 'The size of the file in bytes.'
;
COMMENT ON COLUMN project_attachment.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_attachment.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_attachment.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_attachment.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_attachment.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_attachment IS 'A list of project attachments.'
;

-- 
-- TABLE: project_contact 
--

CREATE TABLE project_contact(
    project_contact_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id            integer           NOT NULL,
    contact_type_id       integer           NOT NULL,
    first_name            varchar(50),
    last_name             varchar(50),
    organization          varchar(100)      NOT NULL,
    email_address         varchar(300),
    phone_number          varchar(20),
    is_primary            character(1)      NOT NULL,
    is_public             character(1)      NOT NULL,
    is_first_nation       boolean           DEFAULT false,
    create_date           timestamptz(6)    DEFAULT now() NOT NULL,
    create_user           integer           NOT NULL,
    update_date           timestamptz(6),
    update_user           integer,
    revision_count        integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_contact_pk PRIMARY KEY (project_contact_id)
)
;



COMMENT ON COLUMN project_contact.project_contact_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_contact.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_contact.contact_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_contact.first_name IS 'The first name of the contact.'
;
COMMENT ON COLUMN project_contact.last_name IS 'The last name of the contact.'
;
COMMENT ON COLUMN project_contact.organization IS 'The organization name of the contact.'
;
COMMENT ON COLUMN project_contact.phone_number IS 'The phone number of the contact.'
;
COMMENT ON COLUMN project_contact.email_address IS 'The email address of the contact.'
;
COMMENT ON COLUMN project_contact.is_primary IS 'A flag that determines whether contact is a primary contact. A value of "Y" provides that contact is a primary contact.'
;
COMMENT ON COLUMN project_contact.is_public IS 'A flag that determines whether contact details are public. A value of "Y" provides that contact details are public.'
;
COMMENT ON COLUMN project_contact.is_first_nation IS 'Determines whether contact is a first nation or and idigenous governing body. A value of "Y" provides that contact details are public.'
;
COMMENT ON COLUMN project_contact.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_contact.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_contact.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_contact.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_contact.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_contact IS 'Contact information for project participants.'
;

-- 
-- TABLE: project_first_nation 
--

CREATE TABLE project_first_nation(
    project_first_nation_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    first_nations_id           integer           NOT NULL,
    project_id                 integer           NOT NULL,
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_first_nation_pk PRIMARY KEY (project_first_nation_id)
)
;



COMMENT ON COLUMN project_first_nation.project_first_nation_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.first_nations_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_first_nation.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_first_nation.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_first_nation.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_first_nation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_first_nation.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_first_nation IS 'A associative entity that joins projects and first nations.'
;

-- 
-- TABLE: project_funding_source 
--

CREATE TABLE project_funding_source(
    project_funding_source_id        integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                       integer           NOT NULL,
    organization_name                varchar(300)      NOT NULL,
    funding_project_id               varchar(50),
    funding_amount                   money             NOT NULL,
    funding_start_date               date,
    funding_end_date                 date,
    description                      varchar(3000),
    is_public                        boolean           DEFAULT false,
    create_date                      timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                      integer           NOT NULL,
    update_date                      timestamptz(6),
    update_user                      integer,
    revision_count                   integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_funding_source_pk PRIMARY KEY (project_funding_source_id)
)
;



COMMENT ON COLUMN project_funding_source.project_funding_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_funding_source.organization_name IS 'The name of the funding source.'
;
COMMENT ON COLUMN project_funding_source.funding_project_id IS 'Identification number used by funding source to reference the project'
;
COMMENT ON COLUMN project_funding_source.funding_amount IS 'Funding amount from funding source.'
;
COMMENT ON COLUMN project_funding_source.funding_start_date IS 'Start date for funding from the source.'
;
COMMENT ON COLUMN project_funding_source.funding_end_date IS 'End date for funding from the source.'
;
COMMENT ON COLUMN project_funding_source.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_funding_source.is_public IS 'Indicates whether the funding source is public or not.'
;
COMMENT ON COLUMN project_funding_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_funding_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_funding_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_funding_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_funding_source IS 'A associative entity that joins projects and funding source details.'
;

-- 
-- TABLE: project_participation 
--

CREATE TABLE project_participation(
    project_participation_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                  integer           NOT NULL,
    system_user_id              integer           NOT NULL,
    project_role_id             integer           NOT NULL,
    create_date                 timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                 integer           NOT NULL,
    update_date                 timestamptz(6),
    update_user                 integer,
    revision_count              integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_participation_pk PRIMARY KEY (project_participation_id)
)
;



COMMENT ON COLUMN project_participation.project_participation_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.project_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_participation.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_participation.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_participation.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_participation.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_participation.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_participation IS 'A associative entity that joins projects, system users and project role types.'
;

-- 
-- TABLE: project_role 
--

CREATE TABLE project_role(
    project_role_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    description              varchar(250)      NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_role_pk PRIMARY KEY (project_role_id)
)
;



COMMENT ON COLUMN project_role.project_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_role.name IS 'The name of the record.'
;
COMMENT ON COLUMN project_role.description IS 'The description of the project role.'
;
COMMENT ON COLUMN project_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_role.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN project_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_role IS 'Project participation roles.'
;

-- 
-- TABLE: project_spatial_component 
--

CREATE TABLE project_spatial_component(
    project_spatial_component_id         integer                     GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                           integer                     NOT NULL,
    project_spatial_component_type_id    integer                     NOT NULL,
    name                                 varchar(50)                 NOT NULL,
    description                          varchar(3000),
    geometry                             geometry(geometry, 3005),
    is_within_overlapping                character(1)                DEFAULT 'N' NOT NULL,
    number_sites                         integer                     NOT NULL,
    size_ha                              numeric(12, 2)              NOT NULL,
    geography                            geography(geometry),
    geojson                              jsonb,
    create_date                          timestamptz(6)              DEFAULT now() NOT NULL,
    create_user                          integer                     NOT NULL,
    update_date                          timestamptz(6),
    update_user                          integer,
    revision_count                       integer                     DEFAULT 0 NOT NULL,
    CONSTRAINT project_spatial_component_pk PRIMARY KEY (project_spatial_component_id)
)
;



COMMENT ON COLUMN project_spatial_component.project_spatial_component_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component.project_spatial_component_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component.name IS 'The name of the record.'
;
COMMENT ON COLUMN project_spatial_component.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_spatial_component.geometry IS 'The containing geometry of the record.'
;
COMMENT ON COLUMN project_spatial_component.is_within_overlapping IS 'Indicates that the area contains or overlaps a known area of cultural or conservation priority.'
;
COMMENT ON COLUMN project_spatial_component.number_sites IS 'Total number of projects sites.'
;
COMMENT ON COLUMN project_spatial_component.size_ha IS 'Total area in hectars of all project sites, excluding overlapping areas.'
;
COMMENT ON COLUMN project_spatial_component.geography IS 'The containing geography of the record.'
;
COMMENT ON COLUMN project_spatial_component.geojson IS 'A JSON representation of the geometry that provides necessary details for shape manipulation in client side tools.'
;
COMMENT ON COLUMN project_spatial_component.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_spatial_component.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_spatial_component.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_spatial_component IS 'Project spatial component persists the various spatial components that a project may include.'
;

-- 
-- TABLE: project_spatial_component_type 
--

CREATE TABLE project_spatial_component_type(
    project_spatial_component_type_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                                 varchar(300)      NOT NULL,
    description                          varchar(250),
    record_effective_date                date              NOT NULL,
    record_end_date                      date,
    create_date                          timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                          integer           NOT NULL,
    update_date                          timestamptz(6),
    update_user                          integer,
    revision_count                       integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_spatial_component_type_pk PRIMARY KEY (project_spatial_component_type_id)
)
;



COMMENT ON COLUMN project_spatial_component_type.project_spatial_component_type_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_spatial_component_type.name IS 'The name of the record.'
;
COMMENT ON COLUMN project_spatial_component_type.description IS 'The description of the record.'
;
COMMENT ON COLUMN project_spatial_component_type.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN project_spatial_component_type.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN project_spatial_component_type.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_spatial_component_type.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component_type.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_spatial_component_type.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_spatial_component_type.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_spatial_component_type IS 'A list of spatial component types.'
;

-- 
-- TABLE: project_species 
--

CREATE TABLE project_species(
    project_species_id       integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    itis_tsn                 integer           NOT NULL,
    project_id               integer           NOT NULL,
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT project_species_pk PRIMARY KEY (project_species_id)
)
;



COMMENT ON COLUMN project_species.project_species_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_species.itis_tsn IS 'Foreign key to taxonomy service describing the taxonomic unit of the record.'
;
COMMENT ON COLUMN project_species.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN project_species.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN project_species.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN project_species.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN project_species.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN project_species.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE project_species IS 'The species of interest to the project.'
;

-- 
-- TABLE: partnership 
--

CREATE TABLE partnership(
    partnership_id                integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    project_id                    integer           NOT NULL,
    partnership                   varchar(300),
    create_date                   timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                   integer           NOT NULL,
    update_date                   timestamptz(6),
    update_user                   integer,
    revision_count                integer           DEFAULT 0 NOT NULL,
    CONSTRAINT partnership_pk PRIMARY KEY (partnership_id)
)
;

COMMENT ON COLUMN partnership.partnership_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN partnership.project_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN partnership.partnership IS 'Partnership description.'
;
COMMENT ON COLUMN partnership.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN partnership.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN partnership.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN partnership.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN partnership.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE partnership IS 'Partnerships associated with the project.'
;

-- 
-- TABLE: system_constant 
--

CREATE TABLE system_constant(
    system_constant_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    constant_name         varchar(50)       NOT NULL,
    character_value       varchar(300),
    numeric_value         numeric(10, 0),
    description           varchar(250),
    create_date           timestamptz(6)    DEFAULT now() NOT NULL,
    create_user           integer           NOT NULL,
    update_date           timestamptz(6),
    update_user           integer,
    revision_count        integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_constant_pk PRIMARY KEY (system_constant_id)
)
;



COMMENT ON COLUMN system_constant.system_constant_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_constant.constant_name IS 'The lookup name of the constant.'
;
COMMENT ON COLUMN system_constant.character_value IS 'The string value of the constant.'
;
COMMENT ON COLUMN system_constant.numeric_value IS 'The numeric value of the constant.'
;
COMMENT ON COLUMN system_constant.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_constant.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_constant.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_constant.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_constant.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_constant.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_constant IS 'A list of system constants necessary for system functionality. Such constants are not editable by system administrators as they are used by internal logic.'
;

-- 
-- TABLE: system_metadata_constant 
--

CREATE TABLE system_metadata_constant(
    system_metadata_constant_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    constant_name                  varchar(50)       NOT NULL,
    character_value                varchar(300),
    numeric_value                  numeric(10, 0),
    description                    varchar(250),
    create_date                    timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                    integer           NOT NULL,
    update_date                    timestamptz(6),
    update_user                    integer,
    revision_count                 integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_metadata_constant_id_pk PRIMARY KEY (system_metadata_constant_id)
)
;



COMMENT ON COLUMN system_metadata_constant.system_metadata_constant_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_metadata_constant.constant_name IS 'The lookup name of the constant.'
;
COMMENT ON COLUMN system_metadata_constant.character_value IS 'The string value of the constant.'
;
COMMENT ON COLUMN system_metadata_constant.numeric_value IS 'The numeric value of the constant.'
;
COMMENT ON COLUMN system_metadata_constant.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_metadata_constant.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_metadata_constant.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_metadata_constant.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_metadata_constant.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_metadata_constant.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_metadata_constant IS 'A list of system metadata constants associated with the business. Such constants are editable by system administrators and are used when publishing data.'
;

-- 
-- TABLE: system_role 
--

CREATE TABLE system_role(
    system_role_id           integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                     varchar(50)       NOT NULL,
    description              varchar(250)      NOT NULL,
    record_effective_date    date              NOT NULL,
    record_end_date          date,
    notes                    varchar(3000),
    create_date              timestamptz(6)    DEFAULT now() NOT NULL,
    create_user              integer           NOT NULL,
    update_date              timestamptz(6),
    update_user              integer,
    revision_count           integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_role_pk PRIMARY KEY (system_role_id)
)
;



COMMENT ON COLUMN system_role.system_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_role.name IS 'The name of the record.'
;
COMMENT ON COLUMN system_role.description IS 'The description of the record.'
;
COMMENT ON COLUMN system_role.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN system_role.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN system_role.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN system_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_role IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: system_user 
--

CREATE TABLE system_user(
    system_user_id             integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    user_identity_source_id    integer           NOT NULL,
    user_identifier            varchar(200)      NOT NULL,
    email                      varchar(300),
    display_name               varchar(50),
    given_name                 varchar(50),
    family_name                varchar(50),
    agency                     varchar(50),
    record_effective_date      date              NOT NULL,
    record_end_date            date,
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_user_pk PRIMARY KEY (system_user_id)
)
;



COMMENT ON COLUMN system_user.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user.user_identity_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user.user_identifier IS 'The identifier of the user.'
;
COMMENT ON COLUMN system_user.email IS 'The email address of the user.'
;
COMMENT ON COLUMN system_user.display_name IS 'The display name of the user.'
;
COMMENT ON COLUMN system_user.given_name IS 'The given name of the user.'
;
COMMENT ON COLUMN system_user.family_name IS 'The family name of the user.'
;
COMMENT ON COLUMN system_user.agency IS 'The agency of the user.'
;
COMMENT ON COLUMN system_user.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN system_user.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN system_user.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_user.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_user.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_user IS 'Agency or Ministry funding the project.'
;

-- 
-- TABLE: system_user_role 
--

CREATE TABLE system_user_role(
    system_user_role_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id         integer           NOT NULL,
    system_role_id         integer           NOT NULL,
    create_date            timestamptz(6)    DEFAULT now() NOT NULL,
    create_user            integer           NOT NULL,
    update_date            timestamptz(6),
    update_user            integer,
    revision_count         integer           DEFAULT 0 NOT NULL,
    CONSTRAINT system_user_role_pk PRIMARY KEY (system_user_role_id)
)
;



COMMENT ON COLUMN system_user_role.system_user_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.system_role_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN system_user_role.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN system_user_role.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user_role.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN system_user_role.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN system_user_role.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE system_user_role IS 'A associative entity that joins system users and system role types.'
;

-- 
-- TABLE: user_identity_source 
--

CREATE TABLE user_identity_source(
    user_identity_source_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    name                       varchar(50)       NOT NULL,
    record_effective_date      date              NOT NULL,
    record_end_date            date,
    description                varchar(250),
    notes                      varchar(3000),
    create_date                timestamptz(6)    DEFAULT now() NOT NULL,
    create_user                integer           NOT NULL,
    update_date                timestamptz(6),
    update_user                integer,
    revision_count             integer           DEFAULT 0 NOT NULL,
    CONSTRAINT user_identity_source_pk PRIMARY KEY (user_identity_source_id)
)
;


COMMENT ON COLUMN user_identity_source.user_identity_source_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN user_identity_source.name IS 'The name of the record.'
;
COMMENT ON COLUMN user_identity_source.record_effective_date IS 'Record level effective date.'
;
COMMENT ON COLUMN user_identity_source.record_end_date IS 'Record level end date.'
;
COMMENT ON COLUMN user_identity_source.description IS 'The description of the record.'
;
COMMENT ON COLUMN user_identity_source.notes IS 'Notes associated with the record.'
;
COMMENT ON COLUMN user_identity_source.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN user_identity_source.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN user_identity_source.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN user_identity_source.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN user_identity_source.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE user_identity_source IS 'The source of the user identifier. This source is traditionally the system that authenticates the user. Example sources could include IDIR, BCEID and DATABASE.'
;

-- 
-- TABLE: webform_draft 
--

CREATE TABLE webform_draft(
    webform_draft_id    integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
    system_user_id      integer           NOT NULL,
    is_project          boolean           NOT NULL,
    name                varchar(300)      NOT NULL,
    data                json              NOT NULL,
    security_token      uuid,
    create_date         timestamptz(6)    DEFAULT now() NOT NULL,
    create_user         integer           NOT NULL,
    update_date         timestamptz(6),
    update_user         integer,
    revision_count      integer           DEFAULT 0 NOT NULL,
    CONSTRAINT webform_draft_pk PRIMARY KEY (webform_draft_id)
)
;



COMMENT ON COLUMN webform_draft.webform_draft_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN webform_draft.system_user_id IS 'System generated surrogate primary key identifier.'
;
COMMENT ON COLUMN webform_draft.is_project IS 'When true project, when false plan.'
;
COMMENT ON COLUMN webform_draft.name IS 'The name of the record.'
;
COMMENT ON COLUMN webform_draft.data IS 'The json data associated with the record.'
;
COMMENT ON COLUMN webform_draft.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.'
;
COMMENT ON COLUMN webform_draft.create_date IS 'The datetime the record was created.'
;
COMMENT ON COLUMN webform_draft.create_user IS 'The id of the user who created the record as identified in the system user table.'
;
COMMENT ON COLUMN webform_draft.update_date IS 'The datetime the record was updated.'
;
COMMENT ON COLUMN webform_draft.update_user IS 'The id of the user who updated the record as identified in the system user table.'
;
COMMENT ON COLUMN webform_draft.revision_count IS 'Revision count used for concurrency control.'
;
COMMENT ON TABLE webform_draft IS 'A persistent store for draft webform data. For example, if a user starts a project creation process and wants to save that information as a draft then the webform data can be persisted for subsequent reload into the project creation process.'
;

-- 
-- INDEX: "Ref299" 
--

CREATE INDEX "Ref299" ON administrative_activity(assigned_system_user_id)
;
-- 
-- INDEX: "Ref2910" 
--

CREATE INDEX "Ref2910" ON administrative_activity(reported_system_user_id)
;
-- 
-- INDEX: "Ref1411" 
--

CREATE INDEX "Ref1411" ON administrative_activity(administrative_activity_type_id)
;
-- 
-- INDEX: "Ref1612" 
--

CREATE INDEX "Ref1612" ON administrative_activity(administrative_activity_status_type_id)
;
-- 
-- INDEX: administrative_activity_status_type_nuk1 
--

CREATE UNIQUE INDEX administrative_activity_status_type_nuk1 ON administrative_activity_status_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: administrative_activity_type_nuk1 
--

CREATE UNIQUE INDEX administrative_activity_type_nuk1 ON administrative_activity_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: first_nations_nuk1 
--

CREATE UNIQUE INDEX first_nations_nuk1 ON first_nations(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: branding_nuk1 
--

CREATE UNIQUE INDEX branding_nuk1 ON branding(name, (record_end_date is NULL)) where record_end_date is null
;
--
-- INDEX: "authorization_types_nuk1"
--

CREATE UNIQUE INDEX "authorization_types_nuk1" ON authorization_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: nrm_region_uk1 
--

CREATE UNIQUE INDEX nrm_region_uk1 ON nrm_region(project_id, objectid)
;
-- 
-- INDEX: "Ref1346" 
--

CREATE INDEX "Ref1346" ON nrm_region(project_id)
;
-- 
-- INDEX: permit_uk1 
--

CREATE INDEX permit_uk1 ON permit(number)
;
-- 
-- INDEX: "Ref2926" 
--

CREATE INDEX "Ref2926" ON permit(system_user_id)
;
-- 
-- INDEX: "Ref1339" 
--

CREATE INDEX "Ref1339" ON permit(project_id)
;
-- 
-- INDEX: project_attachment_uk1 
--

CREATE UNIQUE INDEX project_attachment_uk1 ON project_attachment(project_id, file_name, file_type)
;
-- 
-- INDEX: "Ref1313" 
--

CREATE INDEX "Ref1313" ON project_attachment(project_id)
;
-- 
-- INDEX: "Ref1340" 
--

CREATE INDEX "Ref1340" ON project_contact(project_id)
;
-- 
-- INDEX: "Ref6045" 
--

CREATE INDEX "Ref6045" ON project_contact(contact_type_id)
;
-- 
-- INDEX: project_first_nation_uk1 
--

CREATE UNIQUE INDEX project_first_nation_uk1 ON project_first_nation(first_nations_id, project_id)
;
-- 
-- INDEX: "Ref281" 
--

CREATE INDEX "Ref281" ON project_first_nation(first_nations_id)
;
-- 
-- INDEX: "Ref132" 
--

CREATE INDEX "Ref132" ON project_first_nation(project_id)
;
-- 
-- INDEX: project_funding_source_uk1 
--

CREATE UNIQUE INDEX project_funding_source_uk1 ON project_funding_source(funding_project_id, project_id)
;
-- 
-- INDEX: "Ref135" 
--

CREATE INDEX "Ref135" ON project_funding_source(project_id)
;
-- 
-- INDEX: project_participation_uk1 
--

CREATE UNIQUE INDEX project_participation_uk1 ON project_participation(project_id, system_user_id, project_role_id)
;
-- 
-- INDEX: "Ref1314" 
--

CREATE INDEX "Ref1314" ON project_participation(project_id)
;
-- 
-- INDEX: "Ref2915" 
--

CREATE INDEX "Ref2915" ON project_participation(system_user_id)
;
-- 
-- INDEX: "Ref1516" 
--

CREATE INDEX "Ref1516" ON project_participation(project_role_id)
;
-- 
-- INDEX: project_role_nuk1 
--

CREATE UNIQUE INDEX project_role_nuk1 ON project_role(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: project_spatial_component_uk1 
--

CREATE UNIQUE INDEX project_spatial_component_uk1 ON project_spatial_component(project_id, project_spatial_component_type_id, name)
;
-- 
-- INDEX: "Ref1321" 
--

CREATE INDEX "Ref1321" ON project_spatial_component(project_id)
;
-- 
-- INDEX: "Ref2422" 
--

CREATE INDEX "Ref2422" ON project_spatial_component(project_spatial_component_type_id)
;
-- 
-- INDEX: project_spatial_component_type_uk1 
--

CREATE UNIQUE INDEX project_spatial_component_type_uk1 ON project_spatial_component_type(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: project_species_uk1 
--

CREATE UNIQUE INDEX project_species_uk1 ON project_species(project_id, itis_tsn)
;
-- 
-- INDEX: "Ref1344" 
--

CREATE INDEX "Ref1344" ON project_species(project_id)
;
-- 
-- INDEX: partnership_uk1 
--

CREATE UNIQUE INDEX partnership_uk1 ON partnership(partnership, project_id)
;
-- 
-- INDEX: "Ref1330" 
--

CREATE INDEX "Ref1330" ON partnership(project_id)
;
-- 
-- INDEX: objective_uk1 
--

CREATE UNIQUE INDEX objective_uk1 ON objective(objective, project_id)
;

-- 
-- INDEX: "IX_objective_objective" 
--

CREATE INDEX "IX_objective_objective" ON objective(project_id)
;
-- 
-- INDEX: conservation_area_uk1 
--

CREATE UNIQUE INDEX conservation_area_uk1 ON conservation_area(conservation_area, project_id)
;

-- 
-- INDEX: "IX_conservation_area_conservation_area" 
--

CREATE INDEX "IX_conservation_area_conservation_area" ON conservation_area(project_id)
;
-- 
-- INDEX: system_constant_uk1 
--

CREATE UNIQUE INDEX system_constant_uk1 ON system_constant(constant_name)
;
-- 
-- INDEX: system_metadata_constant_id_uk1 
--

CREATE UNIQUE INDEX system_metadata_constant_id_uk1 ON system_metadata_constant(constant_name)
;
-- 
-- INDEX: system_role_nuk1 
--

CREATE UNIQUE INDEX system_role_nuk1 ON system_role(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: system_user_nuk1 
--

CREATE UNIQUE INDEX system_user_nuk1 ON system_user(user_identifier, record_end_date, user_identity_source_id)
;
-- 
-- INDEX: "Ref2124" 
--

CREATE INDEX "Ref2124" ON system_user(user_identity_source_id)
;
-- 
-- INDEX: system_user_role_uk1 
--

CREATE UNIQUE INDEX system_user_role_uk1 ON system_user_role(system_user_id, system_role_id)
;
-- 
-- INDEX: "Ref296" 
--

CREATE INDEX "Ref296" ON system_user_role(system_user_id)
;
-- 
-- INDEX: "Ref317" 
--

CREATE INDEX "Ref317" ON system_user_role(system_role_id)
;
-- 
-- INDEX: user_identity_source_nuk1 
--

CREATE UNIQUE INDEX user_identity_source_nuk1 ON user_identity_source(name, (record_end_date is NULL)) where record_end_date is null
;
-- 
-- INDEX: "Ref298" 
--

CREATE INDEX "Ref298" ON webform_draft(system_user_id)
;
-- 
-- TABLE: administrative_activity 
--

ALTER TABLE administrative_activity ADD CONSTRAINT "Refsystem_user9" 
    FOREIGN KEY (assigned_system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refsystem_user10" 
    FOREIGN KEY (reported_system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refadministrative_activity_type11" 
    FOREIGN KEY (administrative_activity_type_id)
    REFERENCES administrative_activity_type(administrative_activity_type_id)
;

ALTER TABLE administrative_activity ADD CONSTRAINT "Refadministrative_activity_status_type12" 
    FOREIGN KEY (administrative_activity_status_type_id)
    REFERENCES administrative_activity_status_type(administrative_activity_status_type_id)
;


-- 
-- TABLE: nrm_region 
--

ALTER TABLE nrm_region ADD CONSTRAINT "Refproject46" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: permit 
--

ALTER TABLE permit ADD CONSTRAINT "Refsystem_user26" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE permit ADD CONSTRAINT "Refproject39" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_attachment 
--

ALTER TABLE project_attachment ADD CONSTRAINT "Refproject13" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_contact 
--

ALTER TABLE project_contact ADD CONSTRAINT "Refproject40" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE project_contact ADD CONSTRAINT "Refcontact_type45" 
    FOREIGN KEY (contact_type_id)
    REFERENCES contact_type(contact_type_id)
;


-- 
-- TABLE: project_first_nation 
--

ALTER TABLE project_first_nation ADD CONSTRAINT "Reffirst_nations1" 
    FOREIGN KEY (first_nations_id)
    REFERENCES first_nations(first_nations_id)
;

ALTER TABLE project_first_nation ADD CONSTRAINT "Refproject2" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_funding_source 
--

ALTER TABLE project_funding_source ADD CONSTRAINT "Refproject5" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: project_participation 
--

ALTER TABLE project_participation ADD CONSTRAINT "Refproject14" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE project_participation ADD CONSTRAINT "Refsystem_user15" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE project_participation ADD CONSTRAINT "Refproject_role16" 
    FOREIGN KEY (project_role_id)
    REFERENCES project_role(project_role_id)
;


-- 
-- TABLE: project_spatial_component 
--

ALTER TABLE project_spatial_component ADD CONSTRAINT "Refproject21" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;

ALTER TABLE project_spatial_component ADD CONSTRAINT "Refproject_spatial_component_type22" 
    FOREIGN KEY (project_spatial_component_type_id)
    REFERENCES project_spatial_component_type(project_spatial_component_type_id)
;


-- 
-- TABLE: project_species 
--

ALTER TABLE project_species ADD CONSTRAINT "Refproject44" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: partnership 
--

ALTER TABLE partnership ADD CONSTRAINT "Refproject30" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: objective 
--

ALTER TABLE objective ADD CONSTRAINT "Refproject18790" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: conservation_area 
--

ALTER TABLE conservation_area ADD CONSTRAINT "Refproject18800" 
    FOREIGN KEY (project_id)
    REFERENCES project(project_id)
;


-- 
-- TABLE: system_user 
--

ALTER TABLE system_user ADD CONSTRAINT "Refuser_identity_source24" 
    FOREIGN KEY (user_identity_source_id)
    REFERENCES user_identity_source(user_identity_source_id)
;


-- 
-- TABLE: system_user_role 
--

ALTER TABLE system_user_role ADD CONSTRAINT "Refsystem_user6" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;

ALTER TABLE system_user_role ADD CONSTRAINT "Refsystem_role7" 
    FOREIGN KEY (system_role_id)
    REFERENCES system_role(system_role_id)
;

-- 
-- TABLE: webform_draft 
--

ALTER TABLE webform_draft ADD CONSTRAINT "Refsystem_user8" 
    FOREIGN KEY (system_user_id)
    REFERENCES system_user(system_user_id)
;


