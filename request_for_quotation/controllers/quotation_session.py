import json
from datetime import datetime

from odoo import http
from odoo.http import request

class RFQSessionController(http.Controller):

    @http.route('/api/save_rfq_data', type='json', auth='public', methods=['POST'], csrf=False)
    def save_rfq_data(self, **kwargs):
        """
        Save the form data in the session.
        """
        parsed_kwargs = json.loads(kwargs.get('body'))
        request.session['rfq_data'] = parsed_kwargs
        return {"success": True, "message": "RFQ data saved successfully."}

    @http.route('/api/get_rfq_data', type='json', auth='user')
    def get_rfq_data(self):
        """
        Retrieve the saved form data from the session.
        """
        rfq_data = request.session.get('rfq_data', {})
        print("Session data: ", rfq_data)
        return {"success": True, "data": rfq_data}

    @http.route('/api/remove_rfq_data', type='json', auth='user')
    def remove_rfq_data(self, product_id, product_qty):
        session_data = request.session.get('rfq_data', {})
        if 'products' in session_data:
            session_data['products'] = [
            product for product in session_data['products']
            if not (product.get('product_id') == product_id and product.get('product_qty') == product_qty)
            ]
            request.session['rfq_data'] = session_data
            print(request.session['rfq_data'])
            return {'success': True}