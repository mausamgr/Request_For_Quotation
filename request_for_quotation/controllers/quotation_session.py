import json
from datetime import datetime

from odoo import http
from odoo.http import request

class RFQSessionController(http.Controller):

    @http.route('/api/save_rfq_data', type='json', auth='public', methods=['POST'], csrf=False)
    def save_rfq_data(self, **kwargs):
        parsed_kwargs = json.loads(kwargs.get('body'))
        print("Parsed Kwargs:\t",parsed_kwargs)
        request.session['rfq_data'] = parsed_kwargs
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