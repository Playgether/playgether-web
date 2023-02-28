from django.forms import ModelForm, PasswordInput
from .models import User, Like
from django import forms

class UserForm(ModelForm):
    password = forms.CharField(widget=PasswordInput(attrs={'placeholder':'********','autocomplete': 'off','data-toggle': 'password'}), max_length=15)
    class Meta:
        model = User
        fields = '__all__'
