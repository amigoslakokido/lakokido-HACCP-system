/*
  # Add Official Restaurant First Aid Equipment List
  
  1. Purpose
    - Insert the official approved first aid equipment list for restaurants
    - Based on Norwegian regulations for food service establishments
  
  2. Equipment Items
    - Plaster / bandasjer (Bandages)
    - Elastiske bind (Elastic bandages)
    - Sterile kompresser (Sterile compresses)
    - Saks (Scissors)
    - Pinsett (Tweezers)
    - Engangshansker (Disposable gloves)
    - Øyebadevann / øyeskylle (Eye wash)
    - Førstehjelpshefte (First aid manual)
    - Termisk folie (Thermal foil)
    - Munn-til-munn maske (CPR mask)
    - Isposer (Ice packs)
  
  3. Default Values
    - All items marked as good condition (OK)
    - Standard quantities for restaurant use
    - Notes added for important items
*/

-- Insert official first aid equipment list for restaurants
INSERT INTO hms_first_aid_equipment (
  equipment_name,
  quantity,
  location,
  condition,
  notes,
  last_check_date,
  checked_by
) VALUES
  (
    'Plaster / bandasjer',
    1,
    'Førstehjelpsskap',
    'OK',
    'Standard bandasjer i forskjellige størrelser',
    CURRENT_DATE,
    'System'
  ),
  (
    'Elastiske bind',
    1,
    'Førstehjelpsskap',
    'OK',
    'For å støtte forstuing og forstuelse',
    CURRENT_DATE,
    'System'
  ),
  (
    'Sterile kompresser',
    1,
    'Førstehjelpsskap',
    'OK',
    'Brukes til dekking av sår',
    CURRENT_DATE,
    'System'
  ),
  (
    'Saks',
    1,
    'Førstehjelpsskap',
    'OK',
    'Førstehjelps saks',
    CURRENT_DATE,
    'System'
  ),
  (
    'Pinsett',
    1,
    'Førstehjelpsskap',
    'OK',
    'For fjerning av fremmedlegemer',
    CURRENT_DATE,
    'System'
  ),
  (
    'Engangshansker',
    1,
    'Førstehjelpsskap',
    'OK',
    'Viktig for hygiene og smittevern',
    CURRENT_DATE,
    'System'
  ),
  (
    'Øyebadevann / øyeskylle',
    1,
    'Førstehjelpsskap',
    'OK',
    'Svært viktig i kjøkkenmiljø - brukes ved sprut i øye',
    CURRENT_DATE,
    'System'
  ),
  (
    'Førstehjelpshefte',
    1,
    'Førstehjelpsskap',
    'OK',
    'Instruksjonshefte for førstehjelp',
    CURRENT_DATE,
    'System'
  ),
  (
    'Termisk folie',
    1,
    'Førstehjelpsskap',
    'OK',
    'Brukes ved nedkjøling/hypotermie',
    CURRENT_DATE,
    'System'
  ),
  (
    'Munn-til-munn maske (HLR-maske)',
    1,
    'Førstehjelpsskap',
    'OK',
    'For trygg gjenoppliving',
    CURRENT_DATE,
    'System'
  ),
  (
    'Isposer',
    1,
    'Førstehjelpsskap',
    'OK',
    'Brukes ved hevelser og slag',
    CURRENT_DATE,
    'System'
  )
ON CONFLICT DO NOTHING;
