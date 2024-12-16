# routes/order_routes.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.database import db
from models.order import Order, OrderItem
from utils.audit_logger import log_event
from models.book import Book
import logging
from decimal import Decimal

order_bp = Blueprint('orders', __name__)

@order_bp.route('/orders', methods=['POST'])
@login_required
def create_order():
    data = request.get_json()
    
    if not data:
        logging.warning("No data provided in the request.")
        return jsonify({"error": "No data provided"}), 400
    
    # Extrahování dat z požadavku
    payment_method = data.get('paymentMethod')
    items = data.get('items')  # Očekává se seznam položek s isbn13 a quantity
    
    if not payment_method or not items:
        logging.warning("Payment method or items missing in the request.")
        return jsonify({"error": "Payment method and items are required"}), 400
    
    # Výpočet celkové částky
    total_amount = 0
    order_items = []
    
    for item in items:
        isbn13 = item.get('isbn13')
        quantity = item.get('quantity', 1)
        
        if not isbn13:
            logging.warning("Item missing isbn13.")
            return jsonify({"error": "Each item must have an isbn13"}), 400
        
        book = db.session.query(Book).filter_by(isbn13=isbn13).first()
        if not book:
            logging.warning(f"Book with ISBN13 {isbn13} not found.")
            return jsonify({"error": f"Book with ISBN13 {isbn13} not found"}), 404
        
        # Převod price na float, pokud je Decimal
        if isinstance(book.price, Decimal):
            price = float(book.price)
        else:
            price = book.price or 0.0
        
        total_amount += price * quantity
        
        order_item = OrderItem(
            book_isbn13=isbn13,
            quantity=quantity,
            price=price  # Cena je již float
        )
        order_items.append(order_item)
    
    # Výpočet příplatků na základě způsobu platby
    surcharge = 0
    if payment_method == "dobirka":
        surcharge = 50.0  # Dobírka fixní příplatek
    elif payment_method == "card":
        surcharge = total_amount * 0.01  # 1% příplatek za platbu kartou
    
    total_amount += surcharge
    
    # Vytvoření objednávky
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        payment_method=payment_method,
        items=order_items
    )
    
    try:
        db.session.add(order)
        db.session.commit()
        
        # Logování auditní události
        log_event(
            event_type='create_order',
            event_details={
                'order_id': order.id,
                'total_amount': total_amount,
                'payment_method': payment_method,
                'items': [item.as_dict() for item in order_items]
            },
            user=current_user
        )
        
        # Ladicí výpis
        order_dict = order.as_dict()
        logging.info(f"Order created successfully: {order_dict}")
        
        return jsonify({"message": "Order created successfully", "order": order_dict}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating order: {e}")
        return jsonify({"error": "An error occurred while creating the order."}), 500
