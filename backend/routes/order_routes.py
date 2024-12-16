# routes/order_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.database import db
from models.order import Order, OrderItem
from utils.audit_logger import log_event
from models.book import Book

order_bp = Blueprint('orders', __name__)

@order_bp.route('/orders', methods=['POST'])
@login_required
def create_order():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Extract data from the request
    payment_method = data.get('paymentMethod')
    items = data.get('items')  # Expecting list of items with isbn13 and quantity
    
    if not payment_method or not items:
        return jsonify({"error": "Payment method and items are required"}), 400
    
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item in items:
        isbn13 = item.get('isbn13')
        quantity = item.get('quantity', 1)
        
        if not isbn13:
            return jsonify({"error": "Each item must have an isbn13"}), 400
        
        book = db.session.query(Book).filter_by(isbn13=isbn13).first()
        if not book:
            return jsonify({"error": f"Book with ISBN13 {isbn13} not found"}), 404
        
        price = book.price or 0
        total_amount += price * quantity
        
        order_item = OrderItem(
            book_isbn13=isbn13,
            quantity=quantity,
            price=price
        )
        order_items.append(order_item)
    
    # Create Order
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        payment_method=payment_method,
        items=order_items
    )
    
    try:
        db.session.add(order)
        db.session.commit()
        
        # Log audit event
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
        
        return jsonify({"message": "Order created successfully", "order": order.as_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
