import shutil
import os

paths = ['node_modules', '.next', 'node_modules_old', '.next_old', 'bun.lockb', 'package-lock.json']
for path in paths:
    if os.path.exists(path):
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
                print(f"Deleted directory: {path}")
            else:
                os.remove(path)
                print(f"Deleted file: {path}")
        except Exception as e:
            print(f"Failed to delete {path}: {e}")
