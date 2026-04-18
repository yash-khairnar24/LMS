from PIL import Image

def remove_background(input_path, output_path, threshold=30):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Assuming the top-left pixel is the background color
    bg_color = pixels[0, 0]

    # Create a mask to identify background pixels
    # We will use a simple BFS to find contiguous background pixels from all 4 corners
    visited = set()
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    for start_node in queue:
        if start_node not in visited:
            q = [start_node]
            visited.add(start_node)
            while q:
                x, y = q.pop(0)
                r, g, b, a = pixels[x, y]
                
                # Check if color is within threshold
                if abs(r - bg_color[0]) <= threshold and \
                   abs(g - bg_color[1]) <= threshold and \
                   abs(b - bg_color[2]) <= threshold:
                    pixels[x, y] = (0, 0, 0, 0) # Make transparent
                    
                    # Add neighbors
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                            visited.add((nx, ny))
                            q.append((nx, ny))
                            
    img.save(output_path)
    print(f"Saved transparent image to {output_path}")

remove_background("lms-favicon.png", "lms-favicon-transparent.png")
