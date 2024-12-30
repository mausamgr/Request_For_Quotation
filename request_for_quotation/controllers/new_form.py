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
# class PurchaseController(http.Controller):

#     @http.route('/purchase/save_iteam', type='http', auth="public", website=True)
#     def save_iteam(self, **kwargs):
#         return http.request.render('request_for_quotation.portal_save_rfq', {
#     'title': 'Your Save RFQ',
#     'website_id': 1,
#     'page_name':"save_rfq"

#     })


class PurchaseController(http.Controller):
    @http.route('/purchase/save_iteam', type='http', auth="public", website=True)
    def save_iteam(self, **kwargs):
        rfq_items = http.request.env['purchase.order'].search([]) 
        return http.request.render('request_for_quotation.portal_save_rfq', {
            'title': 'Your Save RFQ',
            'website_id': 1,
            'page_name': "save_rfq",
            'rfqs': rfq_items,
        })
