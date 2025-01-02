{
    'name': 'request for quotation',
    'version': '18.0.1.0.0',
    'category': 'Tools',
    'summary': "",
    'description': """
    """,
    'author': 'Name',
    'website': 'https://www.yourwebsite.com',
    'license': 'LGPL-3',
    'depends': ['base','account','product', 'website_sale','web'],
    'data': [
        # 'wizard/confirm_wizard.xml',
        'views/order.xml',
        'views/rfq_form.xml',
        'views/your_quotation.xml',
    ],
        'assets': {
            'web.assets_frontend':[
                'request_for_quotation/static/src/css/style.css',
                'request_for_quotation/static/src/js/addrow.js',
                ],
        },
    'demo': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}