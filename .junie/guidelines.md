# Project Guidelines
    
Follow modern Angular syntax and best practices like

* use zone-less change detection and OnPush components
* when changing something, always perform immutable update and use immutable array APIs
* make sure to keep components as lean as possible and move any real logic to services
* use signals to consume data in template exclusively, this means there won't be any `async` pipes in the template
* use Angular signals and signal-based APIs, eg `viewChild` instead of `@ViewChild` or `output` instead of `@Output`
* use Angular schematics using `ng generate` to generate new files, that way you will follow prescribed conventions from angular.json