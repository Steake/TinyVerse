import re
import csv

def parse_sql_to_csv(input_file, output_file):
    """Convert SQL INSERT statements to CSV format."""
    
    # Read the SQL file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract column names from CREATE TABLE or INSERT statement
    # Looking for the INSERT INTO statement with column names
    insert_pattern = r"INSERT INTO `questionnaire` \((.*?)\) VALUES"
    match = re.search(insert_pattern, content, re.DOTALL)
    
    if match:
        columns_text = match.group(1)
        columns = [col.strip().strip('`') for col in columns_text.split(',')]
    else:
        # Fallback: extract from CREATE TABLE if INSERT doesn't have column names
        print("Extracting columns from table structure...")
        columns = ['id', 'id_stagiaire', 'nom_stagiaire', 'prenom_stagiaire', 'id_session', 
                   'theme_session', 'date_j1', 'date_j2', 'ville_session', 'q1_formation_avis',
                   'q2_formation_raison_insatisfait', 'q3_formation_conseiller', 
                   'q4_formation_poursuivre_parcours', 'q5_formation_poursuivre_module',
                   'q6_pedagogie_adequation_formation', 'q7_pedagogie_amelioration_connaissance',
                   'q8_pedagogie_equilibre_theorie_pratique', 'q9_pedagogie_variete_activite',
                   'q10_pedagogie_utilite_activite', 'q11_pedagogie_clarte_support_anim',
                   'q12_pedagogie_utilite_support_remis', 'q13_pharmacien_clarte_explication',
                   'q14_pharmacien_illustration_exemple', 'q15_pharmacien_qualite_reponse',
                   'q16_pharmacien_qualite_animation', 'q17_pharmacien_implication_participant',
                   'q18_medecin_clarte_explication', 'q19_medecin_illustration_exemple',
                   'q20_medecin_qualite_reponse', 'q21_medecin_qualite_animation',
                   'q22_medecin_implication_participant', 'q23_pratique_note_entree',
                   'q24_pratique_note_sortie', 'q25_pratique_integrer_homeo',
                   'q26_pratique_valoriser_homeo', 'q27_pratique_mener_interrogatoire',
                   'q28_pratique_delivrance_ordonnance_homeo', 'q29_organisation_lieu',
                   'q30_organisation_nourriture', 'q31_organisation_horaire', 
                   'q32_organisation_champlibre']
    
    # Extract all VALUES from INSERT statements
    values_pattern = r"\((\d+,.*?)\)(?=,\n|\);)"
    matches = re.findall(values_pattern, content, re.DOTALL)
    
    # Write to CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        
        for match in matches:
            # Parse the values, handling quoted strings with commas and escaped quotes
            row = parse_sql_values(match)
            writer.writerow(row)
    
    print(f"Converted {len(matches)} rows to {output_file}")

def parse_sql_values(values_str):
    """Parse SQL VALUES string into a list, handling quotes and NULLs."""
    row = []
    current = ""
    in_quote = False
    escape_next = False
    
    for char in values_str:
        if escape_next:
            current += char
            escape_next = False
            continue
            
        if char == '\\':
            escape_next = True
            continue
            
        if char == "'":
            in_quote = not in_quote
            continue
            
        if char == ',' and not in_quote:
            value = current.strip()
            if value == 'NULL':
                row.append('')
            else:
                row.append(value)
            current = ""
            continue
            
        current += char
    
    # Add last value
    value = current.strip()
    if value == 'NULL':
        row.append('')
    else:
        row.append(value)
    
    return row

if __name__ == "__main__":
    input_file = "/Users/oli/Downloads/AyuGram Desktop/axess.fr.sql"
    output_file = "/Users/oli/code/tinyverse/questionnaire.csv"
    
    parse_sql_to_csv(input_file, output_file)
