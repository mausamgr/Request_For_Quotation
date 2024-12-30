from odoo import http
from odoo.http import request


class PurchaseRequestPortal(http.Controller):

    @http.route('/purchase/new_request', type='http', auth='user', website=True)
    def new_request_form(self):
        products = request.env['product.template'].search([])
        return request.render('request_for_quotation.view_new_request_form',{
            "products": products,
            'page_name':"new_rfq"
        })


class PurchaseController(http.Controller):
    @http.route('/purchase/save_iteam', type='http', auth="public", website=True)
    def save_iteam(self, **kwargs):
        rfqs = request.session.get('rfq_data', {})
        print(rfqs)
        return request.render('request_for_quotation.portal_save_rfq', {
            'title': 'No RFQs Found',
            'website_id': 1,
            'page_name': "save_rfq",
            'rfqs': rfqs,
        })



    
class RFQController(http.Controller):
    @http.route('/my/rfq', type='http', auth='user', website=True)
    def saved_rfqs(self):
        rfqs = request.env['purchase.order'].search([('partner_id', '=', request.env.user.partner_id.id)])
        return request.render('request_for_quotation.portal_save_rfq', {'rfqs': rfqs})
