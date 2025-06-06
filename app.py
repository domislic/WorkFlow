from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@db/workflow'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

db = SQLAlchemy(app)


class Shift(db.Model):
    id_shift = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    shift_type = db.Column(db.String(50), nullable=False)
    pay_for_shift = db.Column(db.Float, nullable=False)
    day_of_week = db.Column(db.String(20), nullable=False)

    payments = db.relationship('Payment', backref='shift', lazy=True)


class Payment(db.Model):
    id_payment = db.Column(db.Integer, primary_key=True)
    id_shift = db.Column(db.Integer, db.ForeignKey('shift.id_shift'), nullable=False)
    total_pay = db.Column(db.Float, nullable=False)
    overtime = db.Column(db.Float, default=0.0)
    night_shift = db.Column(db.Float, default=0.0)


@app.route('/shift', methods=['POST'])
def add_shift():
    data = request.json
    shift = Shift(
        start_time=datetime.fromisoformat(data['start_time']),
        end_time=datetime.fromisoformat(data['end_time']),
        shift_type=data['shift_type'],
        pay_for_shift=data['pay_for_shift'],
        day_of_week=data['day_of_week']
    )
    db.session.add(shift)
    db.session.commit()
    return jsonify({'message': 'Shift added', 'id_shift': shift.id_shift})

@app.route('/payment', methods=['POST'])
def add_payment():
    data = request.json
    payment = Payment(
        id_shift=data['id_shift'],
        total_pay=data['total_pay'],
        overtime=data.get('overtime', 0.0),
        night_shift=data.get('night_shift', 0.0)
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({'message': 'Payment added', 'id_payment': payment.id_payment})


@app.route('/payment', methods=['GET'])
def get_payment():
    results = db.session.query(Payment, Shift).join(Shift).all()
    output = []
    for payment, shift in results:
        output.append({
            'id_payment': payment.id_payment,
            'total_pay': payment.total_pay,
            'overtime': payment.overtime,
            'night_shift': payment.night_shift,
            'shift': {
                'id_shift': shift.id_shift,
                'start_time': shift.start_time.isoformat(),
                'end_time': shift.end_time.isoformat(),
                'shift_type': shift.shift_type,
                'pay_for_shift': shift.pay_for_shift,
                'day_of_week': shift.day_of_week
            }
        })
    return jsonify(output)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8080)

