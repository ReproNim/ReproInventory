import csv
import yaml

def parse_multivalued(value_str):
    if not value_str:
        return None
    # Check for common delimiters and split
    if ',' in value_str:
        return [s.strip() for s in value_str.split(',') if s.strip()]
    if ';' in value_str:
        return [s.strip() for s in value_str.split(';') if s.strip()]
    if ' / ' in value_str:
        return [s.strip() for s in value_str.split(' / ') if s.strip()]
    return [value_str.strip()] # Return as a list even if single valued, for consistency with multivalued fields

def convert_to_boolean(value_str):
    if value_str is None:
        return None
    normalized_value = value_str.strip().lower()
    if normalized_value == 'yes':
        return True
    elif normalized_value == 'no':
        return False
    elif normalized_value == 'na':
        return 'NA' # As per instruction, keep 'NA' as string
    return None # Or handle other unexpected values

def generate_data_yaml(tsv_file_path, yaml_file_path):
    data_entries = []
    
    # Define which fields are expected to be multivalued
    multivalued_fields = {
        'Tag Team', 'Level', 'Platform', 'Keywords', 'Instruction Medium',
        'Delivery', 'Language', 'Programming Language', 'Neuroimaging Software',
        'Imaging Modality', 'Quadrants'
    }

    # Define which fields should be converted to boolean
    boolean_fields = {
        'Open Dataset', 'Assessment', 'Exclude from ReproInventory'
    }

    with open(tsv_file_path, 'r', encoding='utf-8') as tsvfile:
        reader = csv.reader(tsvfile, delimiter='\t')
        
        headers = []
        for i, row in enumerate(reader):
            if i == 0:  # Header row
                headers = [h.strip() for h in row]
            elif i == 1:  # Description row - skip
                continue
            else:  # Data rows
                entry = {}
                for j, value in enumerate(row):
                    field_name = headers[j]
                    
                    # Replace empty strings with None, and 'NA' string as is
                    if value.strip() == '':
                        processed_value = None
                    elif value.strip().lower() == 'na':
                        processed_value = 'NA'
                    else:
                        processed_value = value.strip()

                    # Handle boolean fields
                    if field_name in boolean_fields:
                        entry[field_name.lower().replace(' ', '_')] = convert_to_boolean(processed_value)
                    # Handle multivalued fields
                    elif field_name in multivalued_fields:
                        entry[field_name.lower().replace(' ', '_')] = parse_multivalued(processed_value)
                    else:
                        # For 'ID' specifically, convert to int if possible
                        if field_name == 'ID':
                            try:
                                entry[field_name.lower()] = int(processed_value) if processed_value is not None else None
                            except (ValueError, TypeError):
                                entry[field_name.lower()] = processed_value # Keep as is if cannot convert
                        else:
                            entry[field_name.lower().replace(' ', '_')] = processed_value
                data_entries.append(entry)

    with open(yaml_file_path, 'w', encoding='utf-8') as yamlfile:
        yaml.dump(data_entries, yamlfile, sort_keys=False, default_flow_style=False)

if __name__ == '__main__':
    tsv_input_path = 'ReproInventory-data.tsv'
    yaml_output_path = 'reproinventory_data.yaml'
    generate_data_yaml(tsv_input_path, yaml_output_path)
    print(f"Successfully generated {yaml_output_path}")