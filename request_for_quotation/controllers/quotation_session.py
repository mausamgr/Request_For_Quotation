import json
from datetime import datetime

from odoo import http
from odoo.http import request


class RFQSessionController(http.Controller):

    @http.route('/api/save_rfq_data', type='json', auth='public', methods=['POST'], csrf=False)
    def save_rfq_data(self, **kwargs):
        parsed_kwargs = json.loads(kwargs.get('body', '{}'))
        rfq_data = request.session.setdefault('rfq_data', {})
        request_id = parsed_kwargs.get('request_id', None)
        if not request_id:
            existing_ids = [
                int(key.split('_')[1]) for key in rfq_data.keys() if key.startswith('RQ_') and key.split('_')[1].isdigit()
            ]
            next_id = max(existing_ids, default=0) + 1
            request_id = f"RQ_{next_id:04d}"  # Format as RQ_0001, RQ_0002, etc.
        rfq_data[request_id] = parsed_kwargs
        request.session.update(rfq_data)
        return {"success": True, "message": "RFQ data saved successfully."}
    
    @http.route('/api/get_rfq_data', type='json', auth='user')
    def get_rfq_data(self):
        rfq_data = request.session.get('rfq_data', {})
        return {"success": True, "data": rfq_data}

    @http.route('/api/remove_rfq_data', type='json', auth='user', methods=['POST'], csrf=False)
    def remove_rfq_data(self, **kwargs):
        data = json.loads(request.httprequest.data)
        product_id = data.get('product_id')
        product_qty = data.get('product_qty')

        session_data = request.session.get('rfq_data', {})
        if 'products' in session_data:
            session_data['products'] = [
                product for product in session_data['products']
                if not (str(product.get('product_id')) == str(product_id) and 
                        str(product.get('product_qty')) == str(product_qty))
            ]
            request.session['rfq_data'] = session_data
        return {'success': True}