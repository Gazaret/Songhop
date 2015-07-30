angular.module('songhop.controllers', ['ionic'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, $interval, $ionicLoading, User, Recommendations) {
	// help function for loading
	var showLoading = function() {
		$ionicLoading.show({
			template: '<i class="ion-loading-c"></i>',
			noBackdrop: true
		});
	}

	var hideLoading = function() {
		$ionicLoading.hide();
	}

	showLoading();

	// get our first songs
	Recommendations.init()
		.then(function() {
			
			$scope.currentSong = Recommendations.queue[0];

			return Recommendations.playCurrentSong();
			// next song if 30sec end
			/*$interval(function() {
				Recommendations.nextSong();
				$scope.currentSong = Recommendations.queue[0];
				Recommendations.playCurrentSong();
			},30000)*/
		})
		.then(function() {
			hideLoading();
			$scope.currentSong.loaded = true;

			/*$interval(function() {
				Recommendations.nextSong();
				$scope.currentSong = Recommendations.queue[0];
				Recommendations.playCurrentSong();

				hideLoading();
				$scope.currentSong.loaded = true;
			},30000);*/
		});

	$scope.sendFeedback = function(bool) {
		if(bool) {
			User.addSongToFavorites($scope.currentSong);
		}
		$scope.currentSong.rated = bool;
		$scope.currentSong.hide = true;

		// prepare the next song
		Recommendations.nextSong();

		$timeout(function() {
			// $timeout to allow animation to complete
			$scope.currentSong = Recommendations.queue[0];
			$scope.currentSong.loaded = false;
		},  250);

		Recommendations.playCurrentSong().then(function() {
			$scope.currentSong.loaded = true;
		});
	};

	// used for retrieving the next album image.
  	// if there isn't an album image available next, return empty string.
	$scope.nextAlbumImg = function() {
		if(Recommendations.queue.length > 1) {
			return Recommendations.queue[1].image_large;
		}

		return '';
	};

})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, $window, User) {
	$scope.username = User.username;
	$scope.favorites = User.favorites;

	$scope.openSong = function(song) {
		$window.open(song.open_url, "_system");
	}

	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index);
	}
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, $window, User, Recommendations) {
	// number of favorites in the scope
	$scope.favCount = User.favoriteCount;

	// stop audio when going to faborite tab
	$scope.enteringFavorites = function() {
		// reset count of favorites in fav tab
		User.newFavorites = 0;
		Recommendations.haltAudio();
	};

	$scope.leavingFavorites = function() {
		Recommendations.init();
	};

	$scope.logout = function() {
		User.destroySession();

		// instead of using $state.go, we're going to redirect.
    	// reason: we need to ensure views aren't cached.
		$window.location.href = "index.html";
	}
})

.controller('SplashCtrl', function($scope, $state, User) {

	// signup/login via User.auth
	$scope.submitForm = function(username, signingUp) {
		User.auth(username, signingUp).then(function() {
			// session set, redirect to discover page
			$state.go('tab.discover');
		}, function() {
			alert('Try another username.');
		});
	}
});