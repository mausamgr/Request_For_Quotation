from odoo import http
from odoo.addons.portal.controllers import portal
from odoo.tools.translate import _



class CustomerPortal(portal.CustomerPortal):
    @http.route(['/my/rfq', '/my/rfq/page/<int:page>'], type='http', auth="user", website=True)
    def portal_my_requests_for_quotation(self, page=1, date_begin=None, date_end=None, sortby=None, filterby=None, **kw):
        return self._render_portal(
            "purchase.portal_my_purchase_rfqs",
            page, date_begin, date_end, sortby, filterby,
            [('state','in',['draft','sent','cancel','to approval','done','purchase'])],
            {},
            None,
            "/my/rfq",
            'my_rfqs_history',
            'rfq',
            'rfqs'
            
        )
