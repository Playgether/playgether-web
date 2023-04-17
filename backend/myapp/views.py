from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = 'index.html'


class ProfileListView(TemplateView):
    template_name = 'profile_list.html'


