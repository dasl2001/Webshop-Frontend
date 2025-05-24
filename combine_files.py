import os
import sys
def collect_files(directory, extensions):
    """Collect all files with the given extensions in the directory and its subdirectories."""
    file_contents = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    file_contents[file_path] = f.read()
    return file_contents
def generate_output_file(file_contents, output_file):
    """Generate a single output file with file paths and their contents."""
    with open(output_file, "w", encoding="utf-8") as f:
        for file_path, content in file_contents.items():
            f.write(f"{file_path}\n")
            f.write("..." + "file content" + "...\n")
            f.write(content)
            f.write("\n\n")
def main():
    # Define the file extensions to include
    extensions = [".html", ".css", ".js"]
    output_file = "output.txt"  # Output file name
    # Get the directory from command-line arguments or use the current directory
    if len(sys.argv) > 1:
        directory = sys.argv[1]
    else:
        directory = os.getcwd()  # Use the current working directory
    # Check if the directory exists
    if not os.path.isdir(directory):
        print(f"Error: The directory '{directory}' does not exist.")
        return
    # Collect files and generate the output
    file_contents = collect_files(directory, extensions)
    generate_output_file(file_contents, output_file)
    print(f"All files have been combined into {output_file}")
if __name__ == "__main__":
    main()
