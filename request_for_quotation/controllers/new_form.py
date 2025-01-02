import json

from odoo import http
from odoo.exceptions import AccessError, ValidationError
from odoo.http import request


class RFQController(http.Controller):

    @http.route('/purchase/new_request', type='http', auth='user', website=True)
    def new_request_form(self):
        products = request.env['product.template'].search([])
        return request.render('request_for_quotation.view_new_request_form', {
            "products": products,
            'page_name': "new_rfq"
        })

    @http.route('/purchase/save_iteam', type='http', auth="public", website=True)
    def save_iteam(self, **kwargs):
        rfqs = request.session.get('rfq_data', {})
        valid_rfqs = {key: value for key, value in rfqs.items() if key and key.startswith("RQ_") and value}
        return request.render('request_for_quotation.portal_save_rfq', {
            'title': 'No RFQs Found',
            'website_id': 1,
            'page_name': "save_rfq",
            'rfqs': valid_rfqs,
        })

    @http.route('/purchase/request/<rfq_id>', type='http', auth='user', website=True, csrf=True)
    def get_rfq_request(self, rfq_id, **kwargs):
        rfqs = request.session.get('rfq_data', {})
        rfq_data = rfqs[rfq_id]
        rfq_data['rfq_id'] = rfq_id
        products = request.env['product.template'].search([])
        return request.render('request_for_quotation.view_new_request_form', {
            "products": products,
            "rfq_data": rfq_data,
            'page_name': "new_rfq"
        })

    @http.route('/my/rfq', type='http', auth='user', website=True)
    def saved_rfqs(self):
        rfqs = request.env['purchase.order'].search([('partner_id', '=', request.env.user.partner_id.id)])
        return request.render('request_for_quotation.portal_save_rfq', {
            'rfqs': rfqs
        })


    @http.route('/my/rfqs/delete/<rfq_id>', type='http', auth='user', website=True, csrf=True)
    def delete_rfq(self, rfq_id, **kwargs):
        rfq_data = request.session.get('rfq_data', {})
        if rfq_id in rfq_data:
            del rfq_data[rfq_id]
        request.session.__delitem__('rfq_data')
        request.session['rfq_data'] = rfq_data
        request.session.update(rfq_data)
        return request.redirect('/purchase/save_iteam')



