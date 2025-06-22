import yaml
import json
import os

def convert_yaml_to_json(yaml_input_path, json_output_path):
    """
    Reads a YAML file and converts its content to a JSON file.
    """
    with open(yaml_input_path, 'r', encoding='utf-8') as yaml_file:
        data = yaml.safe_load(yaml_file)
    
    # Ensure the output directory exists
    output_dir = os.path.dirname(json_output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(json_output_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=2)

if __name__ == '__main__':
    yaml_input_path = 'model/reproinventory_data.yaml'
    json_output_path = 'frontend/public/data/reproinventory_data.json'
    convert_yaml_to_json(yaml_input_path, json_output_path)
    print(f"Successfully converted {yaml_input_path} to {json_output_path}")