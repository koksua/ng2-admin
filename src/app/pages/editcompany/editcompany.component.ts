import {Component, ViewChild, ElementRef, OnInit, ViewEncapsulation, OnDestroy, ViewContainerRef } from '@angular/core';
import {Pipe, PipeTransform} from '@angular/core'
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { FileUploader } from 'ng2-file-upload';

import { EditCompanyService } from './editcompany.service';
import * as CryptoJS from 'crypto-js';
import { BaMenuService } from '../../theme';
import { Router } from '@angular/router';

const URL = '/rest/plugandplay/api/v1/ventures/logo';

@Component({
  selector: 'editcompany',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./editcompany.scss'), require('../css/ng2-toastr.min.scss')], 
  template: require('./editcompany.html'),
  providers: [EditCompanyService]
})
export class EditCompanyComponent implements OnInit, OnDestroy {
  id: number;
  private sub: any;
  company: Object;
  formData: Object;
  top100: Object;
  top20: Object;
  lists: any[];
  top20list: any[];
  public error: boolean;
  public loading: boolean;
  public loading20: boolean;
  public pageload: boolean = false;
  submitAttempt = false;
  public uploader:FileUploader = new FileUploader({url: URL});
  currentUser: any;
  role: Observable<any>;
  

constructor(private route: ActivatedRoute, private _companyService: EditCompanyService, public toastr: ToastsManager, vcr: ViewContainerRef, private router: Router, private _menuService: BaMenuService) {
  var bytes  = CryptoJS.AES.decrypt(localStorage.getItem('currentUser'), 'pnp4life!');
  this.currentUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); 
  // VERY IMPORTANT these methods will update the menu and routes dependent on the user role
  this._menuService.updateMenuByRoutes(this._menuService.getPageMenu(this.currentUser));
  this.router.resetConfig(this._menuService.getAuthRoutes(this.currentUser));    
  this.role = this.currentUser.role;
  this._companyService = _companyService;    
  this.toastr.setRootViewContainerRef(vcr);   
      
      
}

 ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.id = +params['id']; // (+) converts string 'id' to a number

       // In a real app: dispatch action to load the details here.       //JSON.stringify(data)
    });
    this._companyService.getVenture(this.id).subscribe(data => this.company = data,
    error => console.error('Error: ' + error),
        () => console.log('Completed!')
    );
    this.initForm();
    this.pageload = true;
  }
  uploadPhoto(){
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => { form.append('id', this.id); };   
    this.uploader.uploadAll();   
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
      //console.log("ImageUpload:uploaded:", item, status);
      //console.log("Response: " +response)
      if(status == 204) {
        this.showError("Couldn't update profile picture, please try again.", "Error")
      } else if (status < 200 || status >= 300){
        this.showError("Couldn't update profile picture, please try again", "Error")
      }
      else {
        this.showSuccess("Profile picture updated!", "Success!");
      }
      };
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  showSuccess(message: string, title: string) {
        this.toastr.success(message, title, {toastLife: 2000});
  }
  showError(message: string, title: string) {
        this.toastr.error(message, title,{toastLife: 2000});
  }
  initSubmit(){
	  this.submitAttempt = true;
  }
  
  updateCompany(){
    // console.log("Update test: "+JSON.stringify(form));
    //console.log("Update test: "+JSON.stringify(this.formData));
    for (var key in this.formData) {
      if (this.formData.hasOwnProperty(key)) {
         //console.log(key + ': ' + this.formData[key])
        if(this.formData[key] != null){
          //console.log(key + " -> " + this.formData[key]);
          this.company[key] = this.formData[key];
        }
      }
    }
    this._companyService.updateVenture(JSON.stringify(this.company)).map(res => {
      // If request fails, throw an Error that will be caught
      if(res.status == 204) {
        this.showError("Couldn't find venture in database to udpate.", "Error")
      } else if (res.status < 200 || res.status >= 300){
        this.showError("Could not update company, please try again.", "Error")
      }
      // If everything went fine, return the response
      else {
        this.showSuccess('Profile has been updated!','Success!');
        return res.json();
        
      }
    }).subscribe(data => this.company = data,
      err => console.error('Error: ' + err),
          () => console.log("Completed!")
      );

  }
  initForm(){
    this.formData = {
      companyName : null,
      blurb : null,
      verticals : null,
      website : null,
      pnpContact : null,
      contactName : null,
      email : null,
      phoneNumber : null,
      totalMoneyRaised : null,
      stage : null,
      b2bb2c : null,
      employees : null,
      location : null,
      city : null,
      competition : null,
      advantage : null,
      background : null,
      founded : null,
      partnerInterests : null,
      caseStudy : null,
      comments : null,
      tags : null,
      materials : null,
      dateOfInvestment : null,
      portfolio : null
    }
  }

}