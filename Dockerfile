# 1. Koristi službeni Python image
FROM python:3.10-slim

# 2. Postavi radni direktorij unutar kontejnera
WORKDIR /app

# 3. Kopiraj sve fajlove u radni direktorij
COPY . .

# 4. Instaliraj potrebne Python biblioteke
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# 5. Pokreni aplikaciju
CMD ["python", "app.py"]