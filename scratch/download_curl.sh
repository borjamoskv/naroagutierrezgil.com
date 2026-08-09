#!/bin/bash
mkdir -p scratch/naroa_eu_images
cd scratch/naroa_eu_images

URL="https://www.naroa.eu"

echo "Fetching HTML from $URL..."
HTML=$(curl -sL "$URL")

# Extract all src attributes starting with img/ or containing .jpg/.png
# We use grep and sed to extract the actual URLs
IMAGES=$(echo "$HTML" | grep -o 'src="[^"]*"' | cut -d '"' -f 2 | grep -iE '\.(jpg|jpeg|png|gif)$')
LINKS=$(echo "$HTML" | grep -o 'href="[^"]*"' | cut -d '"' -f 2 | grep -iE '\.(jpg|jpeg|png|gif)$')

# Combine and unique
ALL_IMAGES=$(echo -e "$IMAGES\n$LINKS" | sort | uniq)

COUNT=0
for img in $ALL_IMAGES; do
    # Remove leading slashes if any, or construct full URL
    if [[ "$img" == http* ]]; then
        FULL_URL="$img"
    elif [[ "$img" == /* ]]; then
        FULL_URL="${URL}${img}"
    else
        FULL_URL="${URL}/${img}"
    fi

    FILENAME=$(basename "$FULL_URL")
    
    # URL encode spaces in URL but not the domain
    # Since these are simple paths like img/images/6.jpg, we can just use curl -sOJ
    echo "Downloading $FULL_URL -> $FILENAME"
    curl -sL "$FULL_URL" -o "$FILENAME"
    if [ $? -eq 0 ]; then
        ((COUNT++))
    else
        echo "Failed to download $FULL_URL"
    fi
done

echo "Downloaded $COUNT images."
