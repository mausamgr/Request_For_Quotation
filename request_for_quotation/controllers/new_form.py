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
        rfqs = request.session.get('rfq_data', [])
        print(rfqs)
        return request.render('request_for_quotation.portal_save_rfq', {
            'title': 'No RFQs Found',
            'website_id': 1,
            'page_name': "save_rfq",
            'rfqs': rfqs,
        })

    @http.route('/my/rfq', type='http', auth='user', website=True)
    def saved_rfqs(self):
        rfqs = request.env['purchase.order'].search([('partner_id', '=', request.env.user.partner_id.id)])
        return request.render('request_for_quotation.portal_save_rfq', {
            'rfqs': rfqs
        })


    @http.route('/my/rfqs/delete/<int:rfq_id>', type='http', auth='user', website=True, csrf=True)
    def delete_rfq(self, rfq_id, **kwargs):
        del request.session['rfq_data']
        # Optionally, you can add deletion logic here, such as deleting the RFQ record from the database.
        return request.redirect('/my/rfq?message=RFQ deleted successfully')

    # @http.route('/my/rfqs/delete/<int:rfq_id>', type='http', auth='user', website=True, csrf=True)
    # def delete_rfq(self, rfq_id, **kwargs):
        
    #     del request.session['rfq_data']
        
    #     return request.redirect('/my/rfq?message=RFQ deleted successfully')
    
        
    # @http.route('/purchase/save_iteam', type='http', auth="public", website=True)
    # def save_iteam(self, **kwargs):
    #     rfqs = request.session.get('rfq_data', [])
    #     if isinstance(rfqs, list) and all(isinstance(rfq, int) for rfq in rfqs):
    #         rfqs = request.env['purchase.order'].browse(rfqs)

    #     return request.render('request_for_quotation.portal_save_rfq', {
    #         'title': 'No RFQs Found',
    #         'website_id': 1,
    #         'page_name': "save_rfq",
    #         'rfqs': rfqs,  
    #     })

