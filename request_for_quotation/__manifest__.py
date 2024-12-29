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
        'views/order.xml',
        'views/rfq_form.xml',
        # 'views/pop_up.xml',
    ],
        'assets': {
            'web.assets_frontend':[
                'request_for_quotation/static/src/css/style.css',
                # 'request_for_quotation/static/src/js/pop_up.js',
                'request_for_quotation/static/src/js/addRow.js',
                ],
        },

    'demo': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}