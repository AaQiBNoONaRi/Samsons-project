const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})
// document.addEventListener('DOMContentLoaded', function() {
//     // Handle sidebar dropdowns
//     const dropdownToggles = document.querySelectorAll('#sidebar .dropdown-toggle');
    
//     dropdownToggles.forEach(toggle => {
//         toggle.addEventListener('click', function(e) {
//             e.preventDefault();
//             const parent = this.parentElement;
            
//             // Close other dropdowns
//             document.querySelectorAll('#sidebar .dropdown').forEach(dropdown => {
//                 if (dropdown !== parent) {
//                     dropdown.classList.remove('active');
//                 }
//             });
            
//             // Toggle current dropdown
//             parent.classList.toggle('active');
//         });
//     });
    
//     // Close dropdowns when clicking outside
//     document.addEventListener('click', function(e) {
//         if (!e.target.closest('#sidebar .dropdown')) {
//             document.querySelectorAll('#sidebar .dropdown').forEach(dropdown => {
//                 dropdown.classList.remove('active');
//             });
//         }
//     });
    
//     // Preserve active state behavior
//     const menuItems = document.querySelectorAll('#sidebar .side-menu > li:not(.dropdown)');
//     menuItems.forEach(item => {
//         item.addEventListener('click', function() {
//             // Remove active class from all items
//             document.querySelectorAll('#sidebar .side-menu > li').forEach(li => {
//                 li.classList.remove('active');
//             });
            
//             // Add active class to clicked item
//             this.classList.add('active');
            
//             // Close all dropdowns
//             document.querySelectorAll('#sidebar .dropdown').forEach(dropdown => {
//                 dropdown.classList.remove('active');
//             });
//         });
//     });
// });