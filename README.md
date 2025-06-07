# WorkFlow

WorkFlow je aplikacija pomoću koje radnici prate svoje odrađene radne sate u bilo kojim smjenama, kao i izračun plaće temeljen na istima, bile to jutarnje, popodnevne ili noćne smjene. Također, moguće je dodati prekovremene sate i dodatne bonuse te izračunati i ukupnu plaću za cijeli mjesec. 

## USECASE DIJAGRAM: 

![Use_case](static/Use_case.jpeg)

## SKIDANJE KODA S GITHUB-A: 
git clone https://github.com/domislic/WorkFlow.git 

cd WorkFlow

git code

## POKRETANJE DOCKERA: 
docker build -t image:3.0 .

docker run -p 5001:8080 image:3.0

http://localhost:5001/
## FUNKCIONALNOSTI:
1. Kreiranje smjena
2. Unošenje satnice
3. Računanje bonusa i prekovremenih sati
3. Izračun ukupne plaće

