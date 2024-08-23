import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

/**
 * Insert new table for partnership types and partnerships.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};
  `);

  // Create the new table
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH = ${DB_SCHEMA};

    CREATE TABLE IF NOT EXISTS restoration.partnership_type (
        partnership_type_id      integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        name                     varchar(50)       NOT NULL,
        record_effective_date    date              NOT NULL,
        record_end_date          date,
        create_date              timestamptz(6)    DEFAULT now() NOT NULL,
        create_user              integer           NOT NULL,
        update_date              timestamptz(6),
        update_user              integer,
        revision_count           integer           DEFAULT 0 NOT NULL,
        CONSTRAINT partnership_type_pk PRIMARY KEY (partnership_type_id)
    );

    COMMENT ON COLUMN restoration.partnership_type.partnership_type_id IS 'Primary key for partnership type.';
    COMMENT ON COLUMN restoration.partnership_type.name IS 'Name of the partnership type.';
    COMMENT ON COLUMN restoration.partnership_type.record_effective_date IS 'Effective date of the record.';
    COMMENT ON COLUMN restoration.partnership_type.record_end_date IS 'End date of the record.';
    COMMENT ON COLUMN restoration.partnership_type.create_date IS 'Date the record was created.';
    COMMENT ON COLUMN restoration.partnership_type.create_user IS 'User that created the record.';
    COMMENT ON COLUMN restoration.partnership_type.update_date IS 'Date the record was updated.';
    COMMENT ON COLUMN restoration.partnership_type.update_user IS 'User that updated the record.';
    COMMENT ON COLUMN restoration.partnership_type.revision_count IS 'Number of times the record has been updated.';
    COMMENT ON TABLE restoration.partnership_type IS 'Lookup table for partnership types.';

    CREATE TABLE IF NOT EXISTS restoration.partnerships (
        partnerships_id          integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        partnership_type_id      integer           NOT NULL,
        name                     varchar(50)       NOT NULL,
        record_effective_date    date              NOT NULL,
        record_end_date          date,
        create_date              timestamptz(6)    DEFAULT now() NOT NULL,
        create_user              integer           NOT NULL,
        update_date              timestamptz(6),
        update_user              integer,
        revision_count           integer           DEFAULT 0 NOT NULL,
        CONSTRAINT partnerships_pk PRIMARY KEY (partnerships_id),
        CONSTRAINT partnerships_partnership_type_fk FOREIGN KEY (partnership_type_id) REFERENCES restoration.partnership_type (partnership_type_id)
    );

    COMMENT ON COLUMN restoration.partnerships.partnerships_id IS 'Primary key for partnerships.';
    COMMENT ON COLUMN restoration.partnerships.partnership_type_id IS 'Foreign key to partnership type.';
    COMMENT ON COLUMN restoration.partnerships.name IS 'Name of the partnership.';
    COMMENT ON COLUMN restoration.partnerships.record_effective_date IS 'Effective date of the record.';
    COMMENT ON COLUMN restoration.partnerships.record_end_date IS 'End date of the record.';
    COMMENT ON COLUMN restoration.partnerships.create_date IS 'Date the record was created.';
    COMMENT ON COLUMN restoration.partnerships.create_user IS 'User that created the record.';
    COMMENT ON COLUMN restoration.partnerships.update_date IS 'Date the record was updated.';
    COMMENT ON COLUMN restoration.partnerships.update_user IS 'User that updated the record.';
    COMMENT ON COLUMN restoration.partnerships.revision_count IS 'Number of times the record has been updated.';
    COMMENT ON TABLE restoration.partnerships IS 'Partnerships for a project.';

    CREATE TABLE IF NOT EXISTS restoration.project_partnership (
        project_partnership_id   integer           GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
        project_id               integer           NOT NULL,
        partnership_type_id      integer           NOT NULL,
        partnerships_id          integer,
        first_nations_id         integer,
        name                     varchar(100),
        create_date              timestamptz(6)    DEFAULT now() NOT NULL,
        create_user              integer           NOT NULL,
        update_date              timestamptz(6),
        update_user              integer,
        revision_count           integer           DEFAULT 0 NOT NULL,
        CONSTRAINT project_partnership_pk PRIMARY KEY (project_partnership_id),
        CONSTRAINT project_partnership_project_fk FOREIGN KEY (project_id) REFERENCES restoration.project (project_id),
        CONSTRAINT project_partnership_partnerships_fk FOREIGN KEY (partnerships_id) REFERENCES restoration.partnerships (partnerships_id),
        CONSTRAINT project_partnership_first_nations_fk FOREIGN KEY (first_nations_id) REFERENCES restoration.first_nations (first_nations_id)
    );

    COMMENT ON COLUMN restoration.project_partnership.project_partnership_id IS 'Primary key for project partnership.';
    COMMENT ON COLUMN restoration.project_partnership.project_id IS 'Foreign key to project.';
    COMMENT ON COLUMN restoration.project_partnership.partnership_type_id IS 'Foreign key to partnership type.';
    COMMENT ON COLUMN restoration.project_partnership.partnerships_id IS 'Foreign key to partnerships.';
    COMMENT ON COLUMN restoration.project_partnership.first_nations_id IS 'Foreign key to first nations.';
    COMMENT ON COLUMN restoration.project_partnership.name IS 'Name of the partnership.';
    COMMENT ON COLUMN restoration.project_partnership.create_date IS 'Date the record was created.';
    COMMENT ON COLUMN restoration.project_partnership.create_user IS 'User that created the record.';
    COMMENT ON COLUMN restoration.project_partnership.update_date IS 'Date the record was updated.';
    COMMENT ON COLUMN restoration.project_partnership.update_user IS 'User that updated the record.';
    COMMENT ON COLUMN restoration.project_partnership.revision_count IS 'Number of times the record has been updated.';
    COMMENT ON TABLE restoration.project_partnership IS 'Project partnerships.';

    ----------------------------------------------------------------------------------------
    -- Create audit/journal triggers
    ----------------------------------------------------------------------------------------

    CREATE TRIGGER audit_partnership_type BEFORE INSERT OR UPDATE OR DELETE ON restoration.partnership_type FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_partnership_type AFTER INSERT OR UPDATE OR DELETE ON restoration.partnership_type FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
    
    CREATE TRIGGER audit_partnerships BEFORE INSERT OR UPDATE OR DELETE ON restoration.partnerships FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_partnerships AFTER INSERT OR UPDATE OR DELETE ON restoration.partnerships FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();
    
    CREATE TRIGGER audit_project_partnership BEFORE INSERT OR UPDATE OR DELETE ON restoration.project_partnership FOR EACH ROW EXECUTE PROCEDURE tr_audit_trigger();
    CREATE TRIGGER journal_project_partnership AFTER INSERT OR UPDATE OR DELETE ON restoration.project_partnership FOR EACH ROW EXECUTE PROCEDURE tr_journal_trigger();


    ----------------------------------------------------------------------------------------
    -- Remove old table
    ----------------------------------------------------------------------------------------

    DROP TABLE IF EXISTS restoration.partnership CASCADE;
  `);

  // insert partnership types
  await knex.raw(`
        SET SEARCH_PATH = ${DB_SCHEMA};
    
        INSERT INTO restoration.partnership_type (name, record_effective_date) 
        VALUES ('Indigenous partner', now());
    
        INSERT INTO restoration.partnership_type (name, record_effective_date) 
        VALUES ('BC Government partner', now());
    
        INSERT INTO restoration.partnership_type (name, record_effective_date) 
        VALUES ('Federal Government partner', now());

        INSERT INTO restoration.partnership_type (name, record_effective_date)
        VALUES ('Stakeholder / Proponent partner', now());

        INSERT INTO restoration.partnership_type (name, record_effective_date)
        VALUES ('Non-governmental organization partner', now());
    `);

  // insert partnerships
  await knex.raw(`
        SET SEARCH_PATH = ${DB_SCHEMA};
    
        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Stakeholder / Proponent partner'), 
            'BC Energy Regulator', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Stakeholder / Proponent partner'), 
            'BC Hydro', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Stakeholder / Proponent partner'), 
            'Fish and Wildlife Compensation Program - Peace', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Stakeholder / Proponent partner'), 
            'Fish and Wildlife Compensation Program - Columbia', 
            now()
        );
        
        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Stakeholder / Proponent partner'), 
            'Fish and Wildlife Compensation Program - Coastal', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'BC Parks Foundation', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Ducks Unlimited', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Fraser Basin Council', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Fraser River Sturgeon Conservation Society', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Freshwater Fisheries Society of BC', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Habitat Conservation Trust Fund', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Nature Conservancy of Canada', 
            now()
        );

        INSERT INTO restoration.partnerships (partnership_type_id, name, record_effective_date)
        VALUES (
            (SELECT partnership_type_id FROM restoration.partnership_type WHERE name = 'Non-governmental organization partner'), 
            'Nature Trust', 
            now()
        );
    `);

  // Update table views
  await knex.raw(`
    SET SEARCH_PATH = ${DB_SCHEMA_DAPI_V1};

    CREATE OR REPLACE VIEW partnership_type AS SELECT * FROM restoration.partnership_type;
    CREATE OR REPLACE VIEW partnerships AS SELECT * FROM restoration.partnerships;
    CREATE OR REPLACE VIEW project_partnership AS SELECT * FROM restoration.project_partnership;
  `);
}

/**
 * Not used.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
