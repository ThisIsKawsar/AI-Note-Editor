<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle'])->name('google.redirect');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [NoteController::class, 'index'])->name('dashboard');
    Route::get('/notes/create', fn() => Inertia::render('NoteEditor'))->name('notes.create');
    Route::post('/notes', [NoteController::class, 'store'])->name('notes.store');
    Route::get('/notes/{note}', [NoteController::class, 'show'])->name('notes.show');
    Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');
    Route::get('/notes/{note}/summarize', [NoteController::class, 'summarize'])->name('notes.summarize');
});

Route::get('/login', function () {
    return inertia('Auth/Login');
})->name('login');