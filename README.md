# WorkFlow

WorkFlow je aplikacija pomoću koje radnici prate svoje odrađene radne sate u bilo kojim smjenama, kao i izračun plaće temeljen na istima, bile to jutarnje, popodnevne ili noćne smjene. Također, moguće je dodati prekovremene sate i dodatne bonuse te izračunati i ukupnu plaću za cijeli mjesec. 

## USECASE DIJAGRAM: 

![Use_case](static/UseCase.jpeg)

## SKIDANJE KODA S GITHUB-A: 
git clone https://github.com/domislic/WorkFlow.git 

cd WorkFlow

git code

## POKRETANJE DOCKERA: 
docker build -t workflow:1.1 .

docker run -p 5001:8080 workflow:1.1

http://localhost:5001/

## FUNKCIONALNOSTI:
1. Kreiranje smjena
2. Unošenje satnice
3. Pregled smjena
4. Računanje bonusa i prekovremenih sati
5. Izračun ukupne plaće

